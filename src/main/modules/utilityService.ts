import {AppRequest, AppSession} from 'models/AppRequest';
import config from 'config';
import {
  deleteDraftClaimFromStore,
  generateRedisKey,
  getCaseDataFromStore,
  getDraftClaimFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {TTLCategory} from 'modules/draft-store/ttlConfig';
import {CivilServiceClient} from '../app/client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {Request} from 'express';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {BusinessProcess} from 'models/businessProcess';
import {syncCaseReferenceCookie} from './cookie/caseReferenceCookie';
import {getRouteParam, normalizeRouteParam, RouteParam} from 'common/utils/routeParamUtils';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ccjCheckAnswersService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const syncCaseReference = (req: Request, claim?: Claim): void => {
  const appRequest = req as AppRequest;
  const session = appRequest.session as AppSession | undefined;

  if (!session) {
    return;
  }

  if (claim?.id) {
    session.caseReference = claim.id;
  } else {
    delete session.caseReference;
  }

  syncCaseReferenceCookie(appRequest);
};

/**
 * Gets the claim from draft store and if not existing, then gets it from ccd.
 * @param claimId
 * @param req
 * @param useRedisKey
 * @returns claim
 */
export const getClaimById = async (claimId: RouteParam, req: Request, useRedisKey = false): Promise<Claim> => {
  const normalizedClaimId = normalizeRouteParam(claimId);
  const userId = (<AppRequest>req)?.session?.user?.id;
  if (useRedisKey && normalizedClaimId === userId) {
    logger.error(`getClaimById: claimId and userId are identical (${normalizedClaimId}), which may lead to incorrect redis key generation.`);
  }
  const redisKey = useRedisKey && normalizedClaimId !== userId ? generateRedisKey(<AppRequest>req) : normalizedClaimId;
  logger.info(`getClaimById: userId: ${userId} claimId: ${normalizedClaimId} redisKey: ${redisKey} useRedisKey: ${useRedisKey}`);
  let claim: Claim = await getCaseDataFromStore(redisKey, true);

  if (claim.isEmpty() && redisKey !== userId) {
    logger.info(`Claim not found in draft store, fetching from civil service: claimId: ${normalizedClaimId}`);
    claim = await civilServiceClient.retrieveClaimDetails(normalizedClaimId, <AppRequest>req);
    if (claim) {
      logger.info(`Claim found in civil service, saving to draft store: claimId: ${normalizedClaimId}`);
      await saveDraftClaim(redisKey, claim, true, userId, TTLCategory.JOURNEY_CACHE);
    } else {
      logger.error(`Case not found in civil service for claimId: ${normalizedClaimId}`);
      throw new Error('Case not found...');
    }
  }
  syncCaseReference(req, claim);
  return claim;
};

/**
 * Loads claim for dashboard: cache-aware read via getClaimById, then syncs latest civil-service
 * state (request-scoped memoisation avoids duplicate calls when cache was cold). Preserves
 * in-progress claimantResponse from Redis without deleting the draft entry first.
 */
export const getDashboardClaimById = async (claimId: RouteParam, req: Request, useRedisKey = false): Promise<Claim> => {
  const normalizedClaimId = normalizeRouteParam(claimId);
  const userId = (<AppRequest>req)?.session?.user?.id;
  const redisKey = useRedisKey && normalizedClaimId !== userId ? generateRedisKey(<AppRequest>req) : normalizedClaimId;
  const cachedClaim = await getClaimById(claimId, req, useRedisKey);
  const latestClaim = await civilServiceClient.retrieveClaimDetails(normalizedClaimId, <AppRequest>req);

  if (!latestClaim) {
    throw new Error('Case not found...');
  }

  latestClaim.claimantResponse = cachedClaim.claimantResponse ?? latestClaim.claimantResponse;
  await saveDraftClaim(redisKey, latestClaim, true, userId, TTLCategory.JOURNEY_CACHE);
  syncCaseReference(req, latestClaim);
  return latestClaim;
};

export const refreshDraftStoreClaimFrom = async (req: Request, useRedisKey = false): Promise<Claim> => {
  const claimId = getRouteParam(req, 'id');
  const userId = (<AppRequest>req)?.session?.user?.id;
  const redisKey = useRedisKey && claimId !== userId ? generateRedisKey(<AppRequest>req) : claimId;
  const oldClaim = await getDraftClaimFromStore(redisKey, true);
  const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
  if (claim) {
    logger.info(`Refreshing claim from draft store: userId: ${userId} redisKey: ${redisKey} claimId: ${claimId}`);
    claim.claimantResponse = oldClaim?.case_data?.claimantResponse;
    logger.info(`Setting claimant response: userId: ${userId} redisKey: ${redisKey} claimantResponse: ${claim.claimantResponse? JSON.stringify(claim.claimantResponse) : 'undefined'}`);
    await deleteDraftClaimFromStore(redisKey);
    await saveDraftClaim(redisKey, claim, true, userId, TTLCategory.JOURNEY_CACHE);
  } else {
    logger.error(`No claim found in draft store for : userId: ${userId} redisKey: ${redisKey} claimId: ${claimId}`);
    throw new Error('Case not found...');
  }
  syncCaseReference(req, claim);
  return claim;
};

/**
 * Gets the claims latest business process from civil service
 * @param claimId, req
 * @returns businessProcess
 */
export const getClaimBusinessProcess = async (claimId: string, req: Request): Promise<BusinessProcess> => {
  const claim: Claim = await civilServiceClient.retrieveClaimDetails(normalizeRouteParam(claimId), <AppRequest>req);
  if (claim) {
    return Object.assign(new BusinessProcess(), claim.businessProcess);
  } else {
    throw new Error('Case not found...');
  }
};

export const getRedisStoreForSession = () => {
  const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
  const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${config.get('services.session.redis.host')}:${config.get('services.session.redis.port')}`;
  return new RedisStore({
    client: new Redis(connectionString),
    prefix: 'citizen-ui-session:',
    ttl: 86400, //prune expired entries every 24h
  });
};
