import {AppRequest} from 'common/models/AppRequest';
import {DraftClaimResponse, DraftClaimManagerResult} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {createOrLoadDraftClaimInDraftStoreDb, getActiveDraftFromDraftStoreDb, updateDraftClaimInStore, deleteDraftClaimFromStore} from './draftStoreDbService';
import {getCachedDraft, setCachedDraft, deleteCachedDraft} from './draftClaimRedisCache';

import {Logger} from '@hmcts/nodejs-logging';
const logger = Logger.getLogger('draftStoreManagerService');

const buildManagerResult = (
  raw: DraftClaimResponse,
  isNew?: boolean,
): DraftClaimManagerResult => {
  const claimResponse = new CivilClaimResponse();
  claimResponse.id = raw.draftId;
  claimResponse.case_data = raw.payload as unknown as CCDClaim;

  return {
    claimResponse,
    rawResponse: raw,
    isNew,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    expiresAt: raw.expiresAt,
  };
};

export const getDraftClaim = async (req: AppRequest): Promise<DraftClaimManagerResult | null> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user Id required to fetch draft');
  }

  const cached = await getCachedDraft(userId);

  if (cached) {
    logger.info(`[draftStoreManagerService] returning cached draft for user: ${userId}`);
    return buildManagerResult(cached);
  }
  logger.info(`[draftStoreManagerService] cached miss for user: ${userId} fetching from db instead`);
  const dbResult = await getActiveDraftFromDraftStoreDb(req);
  if (!dbResult) {
    return null;
  }
  await setCachedDraft(userId, dbResult.rawResponse);
  return buildManagerResult(dbResult.rawResponse);
};

export const createOrLoadDraft = async (req: AppRequest, claim?: Claim): Promise<DraftClaimManagerResult> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to create/load draft');
  }

  const dbResult = await createOrLoadDraftClaimInDraftStoreDb(req, claim);
  await setCachedDraft(userId, dbResult.rawResponse);
  return buildManagerResult(dbResult.rawResponse, dbResult.isNew);
};

export const updateDraftClaim = async (req: AppRequest, claim: Claim, draftId: string): Promise<DraftClaimManagerResult> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to update draft');
  }
  if (!draftId) {
    throw new Error('[draftStoreManagerService] draft id required to update draft');
  }

  const dbResult = await updateDraftClaimInStore(req, draftId, claim);
  await setCachedDraft(userId, dbResult.rawResponse);
  return buildManagerResult(dbResult.rawResponse);
};

export const deleteDraftClaim = async (req: AppRequest, draftId: string): Promise<void> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to delete draft');
  }
  await deleteDraftClaimFromStore(req, draftId);
  await deleteCachedDraft(userId);
};
