import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'common/models/AppRequest';
import {DraftClaimResponse, DraftClaimManagerResult} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {
  createOrLoadDraftClaimInDraftStoreDb,
  getActiveDraftFromDraftStoreDb,
  getDraftForCaseFromDraftStoreDb,
  updateDraftClaimInStore,
  applyPaymentRetentionInDraftStoreDb,
  deleteDraftClaimFromStore,
} from './draftStoreDbService';
import {
  getDraftClaimFromStore,
  saveDraftClaim,
  createDraftClaimInStoreWithExpiryTime,
  deleteDraftClaimFromStore as deleteDraftClaimFromRedis,
} from './draftStoreService';
import {getCachedDraft, deleteCachedDraft} from './draftClaimRedisCache';
import {migrateDbDraftToRedis, migrateRedisDraftToDb} from './draftClaimStoreMigration';

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

const buildManagerResultFromRedis = (
  stored: CivilClaimResponse,
  isNew?: boolean,
): DraftClaimManagerResult => {
  const caseData = stored.case_data as unknown as Claim | undefined;
  const createdAt = caseData?.draftClaimCreatedAt
    ? new Date(caseData.draftClaimCreatedAt).toISOString()
    : '';
  return buildManagerResult({
    draftId: stored.id,
    payload: (stored.case_data ?? {}) as unknown as Record<string, unknown>,
    createdAt,
    updatedAt: '',
    expiresAt: '',
  }, isNew);
};

export const getDraftClaim = async (req: AppRequest): Promise<DraftClaimManagerResult | null> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user Id required to fetch draft');
  }

  if (await isDraftClaimDatabaseEnabled()) {
    const cached = await getCachedDraft(userId);

    if (cached && !cached.caseId) {
      return buildManagerResult(cached);
    }
    const dbResult = await getActiveDraftFromDraftStoreDb(req);
    if (dbResult) {
      return buildManagerResult(dbResult.rawResponse);
    }
    const migrated = await migrateRedisDraftToDb(req, userId);
    return migrated ? buildManagerResult(migrated) : null;
  }

  const stored = await getDraftClaimFromStore(userId, true);
  if (stored?.case_data) {
    return buildManagerResultFromRedis(stored);
  }
  const migrated = await migrateDbDraftToRedis(req, userId);
  return migrated ? buildManagerResultFromRedis(migrated) : null;
};

export const getDraftClaimForCase = async (req: AppRequest, caseId: string): Promise<DraftClaimManagerResult | null> => {
  if (!(await isDraftClaimDatabaseEnabled())) {
    return null;
  }
  const dbResult = await getDraftForCaseFromDraftStoreDb(req, caseId);
  return dbResult ? buildManagerResult(dbResult.rawResponse) : null;
};

export const createOrLoadDraft = async (req: AppRequest, claim?: Claim): Promise<DraftClaimManagerResult> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to create/load draft');
  }

  if (await isDraftClaimDatabaseEnabled()) {
    const existingDb = await getActiveDraftFromDraftStoreDb(req);
    if (!existingDb) {
      const migrated = await migrateRedisDraftToDb(req, userId);
      if (migrated) {
        if (claim) {
          const updated = await updateDraftClaimInStore(req, migrated.draftId, claim);
          return buildManagerResult(updated.rawResponse, false);
        }
        return buildManagerResult(migrated, false);
      }
    }
    const dbResult = await createOrLoadDraftClaimInDraftStoreDb(req, claim);
    return buildManagerResult(dbResult.rawResponse, dbResult.isNew);
  }

  let stored = await getDraftClaimFromStore(userId, true);
  let isNew = !stored?.case_data;
  if (isNew) {
    const migrated = await migrateDbDraftToRedis(req, userId);
    if (migrated) {
      stored = migrated;
      isNew = false;
    }
  }
  if (!stored?.case_data) {
    await createDraftClaimInStoreWithExpiryTime(userId);
    isNew = true;
  }
  if (claim) {
    await saveDraftClaim(userId, claim, true, userId);
  }
  const latest = await getDraftClaimFromStore(userId, true);
  return buildManagerResultFromRedis(latest, isNew);
};

export const updateDraftClaim = async (req: AppRequest, claim: Claim, draftId: string): Promise<DraftClaimManagerResult> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to update draft');
  }
  if (!draftId) {
    throw new Error('[draftStoreManagerService] draft id required to update draft');
  }

  if (await isDraftClaimDatabaseEnabled()) {
    const dbResult = await updateDraftClaimInStore(req, draftId, claim);
    return buildManagerResult(dbResult.rawResponse);
  }

  await saveDraftClaim(userId, claim, true, userId);
  const latest = await getDraftClaimFromStore(userId, true);
  return buildManagerResultFromRedis(latest);
};

export const deleteDraftClaim = async (req: AppRequest, draftId: string): Promise<void> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to delete draft');
  }

  if (await isDraftClaimDatabaseEnabled()) {
    await deleteDraftClaimFromStore(req, draftId);
    await deleteCachedDraft(userId);
    return;
  }

  await deleteDraftClaimFromRedis(userId);
};

export const applyPaymentRetention = async (
  req: AppRequest,
  draftId: string,
): Promise<DraftClaimManagerResult | null> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new Error('[draftStoreManagerService] user id required to apply payment retention');
  }
  if (!draftId) {
    throw new Error('[draftStoreManagerService] draft id required to apply payment retention');
  }

  if (!(await isDraftClaimDatabaseEnabled())) {
    return null;
  }

  const dbResult = await applyPaymentRetentionInDraftStoreDb(req, draftId);
  await deleteCachedDraft(userId);
  return buildManagerResult(dbResult.rawResponse);
};
