import {AppRequest} from 'models/AppRequest';
import config from 'config';
import { generateRedisKey, generateRedisKeyForGA, getCaseDataFromStore, getCaseDataFromStoreForGA, saveDraftClaim, saveDraftForGA } from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from '../app/client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {Request} from 'express';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { getApplicationFromGAService } from 'services/features/generalApplication/generalApplicationService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

/**
 * Gets the claim from draft store and if not existing then gets it from ccd.
 * @param claimId, req, useRedisKey
 * @returns claim
 */
export const getClaimById = async (claimId: string, req: Request, useRedisKey = false): Promise<Claim> => {
  const redisKey = useRedisKey ? generateRedisKey(<AppRequest>req) : claimId;
  let claim: Claim = await getCaseDataFromStore(redisKey, true);
  const userId = (<AppRequest>req)?.session?.user?.id;
  if (claim.isEmpty() && redisKey != userId) {
    claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim) {
      await saveDraftClaim(redisKey, claim, true);
    } else {
      throw new Error('Case not found...');
    }
  }
  return claim;
};

export const getGeneralApplicationById = async (gaId: string, req: AppRequest, useRedisKey = false): Promise<GeneralApplication> => {
  const redisKey = useRedisKey ? generateRedisKeyForGA(<AppRequest>req) : gaId;
  let gaApplication: GeneralApplication = await getCaseDataFromStoreForGA(redisKey, true);
  const userId = (<AppRequest>req)?.session?.user?.id;
  if (gaApplication.isEmptyGA() && redisKey != userId) {
    const applicationResonse = await getApplicationFromGAService(req, gaId);
    //const gaApplication: GeneralApplication = new GeneralApplication();
    gaApplication = Object.assign(new GeneralApplication(), applicationResonse?.case_data);
    gaApplication.id = applicationResonse?.id;
    //return gaApplication;
    if (gaApplication) {
      await saveDraftForGA(redisKey, gaApplication, true);
    } else {
      throw new Error('Case not found...');
    }
  }
  return gaApplication;
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
