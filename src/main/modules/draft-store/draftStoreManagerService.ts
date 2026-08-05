import {AppRequest} from 'common/models/AppRequest';
import {DraftClaimResponse} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {createDraftClaimInDraftStoreDb, getActiveDraftFromDraftStoreDb, updateDraftClaimInStore, deleteDraftClaimFromStore} from './draftStoreDbService';
import {getCachedDraft, setCachedDraft, deleteCachedDraft} from './draftClaimRedisCache';

import {Logger} from '@hmcts/nodejs-logging';
const logger = Logger.getLogger('draftStoreManagerService');

const mapRawToCivilResponse = (raw: DraftClaimResponse): CivilClaimResponse => {
  const res = new CivilClaimResponse();
  res.id = raw.draftId;
  res.case_data = raw.payload as unknown as CCDClaim;
  return res;
};

export const getDraftClaim = async (req: AppRequest): Promise<CivilClaimResponse | null> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user Id required to fetch draft');
  }

  const cached = await getCachedDraft(userId);

  if (cached) {
    logger.info(`[draftStoreMangerService] returning cached draft for user: ${userId}`);
    return mapRawToCivilResponse(cached);
  }
  logger.info(`[draftStoreMangerService] cached miss for user: ${userId} fetching from db instead`);
  const dbResult = await getActiveDraftFromDraftStoreDb(req);
  if (!dbResult) {
    return null;
  }
  await setCachedDraft(userId, dbResult.rawResponse);
  return dbResult.claimResponse;
};

export const saveDraftClaim = async (req: AppRequest, claim: Claim, draftId?: string): Promise<CivilClaimResponse> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreMangerService] user id required to save draft');
  }
  let dbResult;
  if (draftId) {
    dbResult = await updateDraftClaimInStore(req, draftId, claim);
  } else {
    dbResult = await createDraftClaimInDraftStoreDb(req, claim);
  }
  await setCachedDraft(userId, dbResult.rawResponse);
  return dbResult.claimResponse;
};

export const deleteDraftClaim = async (req: AppRequest, draftId: string): Promise<void> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreMangerService] user id required to delete draft');
  }
  await deleteDraftClaimFromStore(req, draftId);
  await deleteCachedDraft(userId);
};
