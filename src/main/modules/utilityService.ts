import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from '../app/client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {Request} from 'express';

import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {replaceDashboardPlaceholders} from 'services/dashboard/dashboardInterpolationService';

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

export const getRedisStoreForSession = () => {
  const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
  const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${config.get('services.session.redis.host')}:${config.get('services.session.redis.port')}`;
  return new RedisStore({
    client: new Redis(connectionString),
    prefix: 'citizen-ui-session:',
    ttl: 86400, //prune expired entries every 24h
  });
};

export const getNotificationById = async (claimId: string, claim: Claim, caseRole: string, req: AppRequest): Promise<DashboardNotificationList> => {
  const dashboardNotifications = await civilServiceClient.retrieveNotification(claimId, caseRole, req);
  if (dashboardNotifications) {
    dashboardNotifications.items.forEach((notification) => {
      notification.descriptionEn = replaceDashboardPlaceholders(notification.descriptionEn, claim);
      notification.descriptionCy = replaceDashboardPlaceholders(notification.descriptionCy, claim);
    });
    return dashboardNotifications;
  } else {
    throw new Error('Notifications not found...');
  }
};

export const getDashboardById = async (claimId: string, claim:Claim, caseRole: string, req: AppRequest): Promise<Dashboard> => {
  const dashboard = await civilServiceClient.retrieveDashboard(claimId, caseRole, req);
  if (dashboard) {
    dashboard.items.forEach((taskList) => {
      taskList.tasks.forEach((task) => {
        task.taskNameEn = replaceDashboardPlaceholders(task.taskNameEn, claim);
        task.taskNameCy = replaceDashboardPlaceholders(task.taskNameCy, claim);
        task.hintTextEn = replaceDashboardPlaceholders(task.hintTextEn, claim);
        task.hintTextCy = replaceDashboardPlaceholders(task.hintTextCy, claim);
      });
    });
    return dashboard;
  } else {
    throw new Error('Dashboard not found...');
  }
};
