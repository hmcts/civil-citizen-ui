import {app} from '../../app-instance';
import {AppRequest} from 'common/models/AppRequest';
import {DraftClaimResponse} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {
  CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS,
  createOrLoadDraftClaimInDraftStoreDb,
  getActiveDraftFromDraftStoreDb,
  deleteDraftClaimFromStore as deleteDraftClaimFromDb,
} from './draftStoreDbService';
import {
  getDraftClaimFromStore,
  deleteDraftClaimFromStore as deleteDraftClaimFromRedis,
} from './draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftClaimStoreMigration');

const remainingSecondsUntil = (expiresAt: string | undefined): number => {
  if (!expiresAt) {
    return 0;
  }
  return Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
};

const claimFromCaseData = (caseData: unknown): Claim =>
  Object.assign(new Claim(), caseData as Claim);

export const migrateRedisDraftToDb = async (
  req: AppRequest,
  userId: string,
): Promise<DraftClaimResponse | null> => {
  const stored = await getDraftClaimFromStore(userId, true);
  if (!stored?.case_data) {
    return null;
  }

  const claim = claimFromCaseData(stored.case_data);
  claim.draftClaimCacheTtlDays = CIVIL_SERVICE_DRAFT_CLAIM_RETENTION_DAYS;

  logger.info(
    `[draftClaimStoreMigration] migrating Redis draft for user ${userId} to DB` +
      (claim.draftClaimCreatedAt ? ` with draftClaimCreatedAt=${new Date(claim.draftClaimCreatedAt).toISOString()}` : ''),
  );

  // Lets civil-service keep the original expiry of drafts created under the legacy 180-day Redis TTL.
  const remainingSeconds = await app.locals.draftStoreClient.ttl(userId);
  if (remainingSeconds > 0) {
    claim.draftClaimExpiresAt = new Date(Date.now() + remainingSeconds * 1000);
  }

  const dbResult = await createOrLoadDraftClaimInDraftStoreDb(req, claim);
  try {
    await deleteDraftClaimFromRedis(userId);
  } catch (deleteError) {
    logger.error(`[draftClaimStoreMigration] failed to delete Redis draft for ${userId}, undoing DB copy`);
    if (dbResult.isNew) {
      await deleteDraftClaimFromDb(req, dbResult.rawResponse.draftId);
    }
    throw deleteError;
  }
  if (req.session) {
    req.session.draftId = dbResult.rawResponse.draftId;
  }
  return dbResult.rawResponse;
};

export const migrateDbDraftToRedis = async (
  req: AppRequest,
  userId: string,
): Promise<CivilClaimResponse | null> => {
  const stored = await getDraftClaimFromStore(userId, true);
  if (stored?.case_data) {
    return null;
  }

  const dbResult = await getActiveDraftFromDraftStoreDb(req);
  if (!dbResult) {
    return null;
  }

  const claim = claimFromCaseData(dbResult.rawResponse.payload);
  if (!claim.draftClaimCreatedAt && dbResult.rawResponse.createdAt) {
    claim.draftClaimCreatedAt = new Date(dbResult.rawResponse.createdAt);
  }

  const remainingSeconds = remainingSecondsUntil(dbResult.rawResponse.expiresAt);
  if (remainingSeconds <= 0) {
    logger.info(`[draftClaimStoreMigration] skipping DB→Redis migrate for ${userId}: draft already expired`);
    return null;
  }

  const draftId = dbResult.rawResponse.draftId;
  logger.info(
    `[draftClaimStoreMigration] migrating DB draft ${draftId} to Redis for user ${userId}`,
  );

  const redisDraft = new CivilClaimResponse();
  redisDraft.id = userId;
  redisDraft.case_data = claim as unknown as CivilClaimResponse['case_data'];
  await app.locals.draftStoreClient.set(userId, JSON.stringify(redisDraft), 'EX', remainingSeconds);

  try {
    await deleteDraftClaimFromDb(req, draftId);
  } catch (deleteError) {
    logger.error(`[draftClaimStoreMigration] failed to delete DB draft ${draftId}, undoing Redis copy`);
    await deleteDraftClaimFromRedis(userId);
    throw deleteError;
  }
  if (req.session?.draftId === draftId) {
    delete req.session.draftId;
  }
  return redisDraft;
};
