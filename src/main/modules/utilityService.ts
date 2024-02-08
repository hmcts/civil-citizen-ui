import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from 'app/client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {Request} from 'express';

import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

/**
 * Gets the claim from draft store and if not existing then gets it from ccd.
 * @param claimId, req
 * @returns claim
 */
export const getClaimById = async (claimId: string, req: Request, useRedisKey = false): Promise<Claim> => {
  const redisKey = useRedisKey ? generateRedisKey(<AppRequest>req) : claimId;
  let claim: Claim = await getCaseDataFromStore(redisKey, true);
  if (claim.isEmpty()) {
    claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim) {
      await saveDraftClaim(redisKey, claim, true);
    } else {
      throw new Error('Case not found...');
    }
  }
  return claim;
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

export const getNotificationById = async (claimId: string): Promise<DashboardNotificationList> => {
  const dashboardNotifications = await civilServiceClient.retrieveNotificationDetails(claimId);
  if (dashboardNotifications) {
    return dashboardNotifications;
  } else {
    throw new Error('Notifications not found...');
  }
};

export const getDashboardById = async (claimId: string): Promise<Dashboard> => {
  const dashboard = await civilServiceClient.retrieveDashboardDetails(claimId);
  if (dashboard) {
    return dashboard;
  } else {
    throw new Error('Dashboard not found...');
  }
};
