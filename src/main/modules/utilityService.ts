import {AppRequest, AppSession} from 'models/AppRequest';
import config from 'config';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from '../app/client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {Request} from 'express';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {BusinessProcess} from 'models/businessProcess';
import {syncCaseReferenceCookie} from './cookie/caseReferenceCookie';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

/**
 * Gets the claim from draft store and if not existing then gets it from ccd.
 * @param claimId, req, useRedisKey
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
  const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${config.get('services.session.redis.host')}:${config.get('services.session.redis.port')}`;
  return new RedisStore({
    client: new Redis(connectionString),
    prefix: 'citizen-ui-session:',
    ttl: 86400, //prune expired entries every 24h
  });
};
