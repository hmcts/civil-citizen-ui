import {AppRequest, AppSession} from 'models/AppRequest';
import config from 'config';
import {
  deleteDraftClaimFromStore,
  generateRedisKey,
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from '../app/client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {Request} from 'express';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {BusinessProcess} from 'models/businessProcess';
import {syncCaseReferenceCookie} from './cookie/caseReferenceCookie';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('utilityService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

/**
 * Gets the claim from draft store and if not existing, then gets it from ccd.
 * @param claimId
 * @param req
 * @param useRedisKey
 * @returns claim
 */
export const getClaimById = async (claimId: string, req: Request, useRedisKey = false): Promise<Claim> => {
  const userId = (<AppRequest>req)?.session?.user?.id;
  const redisKey = useRedisKey && claimId !== userId ? generateRedisKey(<AppRequest>req) : claimId;
  let claim: Claim = await getCaseDataFromStore(redisKey, true);

  if (claim.isEmpty() && redisKey !== userId) {
    claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim) {
      await saveDraftClaim(redisKey, claim, true);
    } else {
      throw new Error('Case not found...');
    }
  }
  const appRequest = <AppRequest>req;
  const session = (appRequest.session as AppSession | undefined);

  if (session) {
    if (claim?.id) {
      session.caseReference = claim.id;
    } else {
      delete session.caseReference;
    }
    syncCaseReferenceCookie(appRequest);
  }
  return claim;
};

export const refreshDraftStoreClaimFrom = async (req: Request, useRedisKey = false): Promise<Claim> => {
  const userId = (<AppRequest>req)?.session?.user?.id;
  const claimId = req.params?.id;
  const redisKey = useRedisKey && claimId !== userId ? generateRedisKey(<AppRequest>req) : claimId;

  const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
  if (claim) {
    await deleteDraftClaimFromStore(redisKey);
    await saveDraftClaim(redisKey, claim, true);
  } else {
    throw new Error('Case not found...');
  }
  const appRequest = <AppRequest>req;
  const session = (appRequest.session as AppSession | undefined);

  if (session) {
    if (claim?.id) {
      session.caseReference = claim.id;
    } else {
      delete session.caseReference;
    }
    syncCaseReferenceCookie(appRequest);
  }
  return claim;
};

/**
 * Gets the claims latest business process from civil service
 * @param claimId, req
 * @returns businessProcess
 */
export const getClaimBusinessProcess = async (claimId: string, req: Request): Promise<BusinessProcess> => {
  const claim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
  if (claim) {
    return Object.assign(new BusinessProcess(), claim.businessProcess);
  } else {
    throw new Error('Case not found...');
  }
};

export const getRedisStoreForSession = () => {
  const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
  const host = config.get('services.session.redis.host');
  const port = config.get('services.session.redis.port');
  const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${host}:${port}`;
  /* istanbul ignore next -- investigation logging for Redis session store */
  logger.info('Redis session store created', { host, port, prefix: 'citizen-ui-session:', ttl: 86400 }); // NOSONAR
  return new RedisStore({
    client: new Redis(connectionString),
    prefix: 'citizen-ui-session:',
    ttl: 86400, //prune expired entries every 24h
  });
};
