import {app} from '../../app-instance';
import {AppRequest} from 'common/models/AppRequest';
import {DraftClaimResponse} from 'common/models/draft/draftClaim';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {
  createOrLoadDraftClaimInDraftStoreDb,
  getActiveDraftFromDraftStoreDb,
} from './draftStoreDbService';
import {
  getDraftClaimFromStore,
  deleteDraftClaimFromStore as deleteDraftClaimFromRedis,
} from './draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('draftClaimStoreMigration');

const DAY_TO_SECONDS = 86400;

const remainingDaysFromSeconds = (ttlSeconds: number): number =>
  Math.max(1, Math.ceil(ttlSeconds / DAY_TO_SECONDS));

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
  const ttlSeconds = await app.locals.draftStoreClient.ttl(userId);
  if (ttlSeconds > 0) {
    claim.draftClaimCacheTtlDays = remainingDaysFromSeconds(ttlSeconds);
  }

  logger.info(
    `[draftClaimStoreMigration] migrating Redis draft for user ${userId} to DB` +
      (ttlSeconds > 0 ? ` with remaining TTL ${ttlSeconds}s` : ''),
  );

  const dbResult = await createOrLoadDraftClaimInDraftStoreDb(req, claim);
  try {
    await deleteDraftClaimFromRedis(userId);
  } catch (deleteError) {
    logger.warn(
      `[draftClaimStoreMigration] migrated to DB but failed to delete Redis draft for ${userId}`,
      deleteError,
    );
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

  logger.info(
    `[draftClaimStoreMigration] migrating DB draft ${dbResult.rawResponse.draftId} to Redis for user ${userId}`,
  );

  const redisDraft = new CivilClaimResponse();
  redisDraft.id = userId;
  redisDraft.case_data = claim as unknown as CivilClaimResponse['case_data'];
  await app.locals.draftStoreClient.set(userId, JSON.stringify(redisDraft), 'EX', remainingSeconds);
  return redisDraft;
};
