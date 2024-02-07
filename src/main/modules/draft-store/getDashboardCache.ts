import {app} from '../../app';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {Dashboard} from 'models/dashboard/dashboard';
import {ClaimantOrDefendant} from 'models/partyType';
import {DashboardContentType} from 'models/dashboardContentType';
import {plainToInstance} from 'class-transformer';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');

export const saveDashboardContentTypeToCache = async (lists: Dashboard | DashboardNotificationList, dashboardContentType: DashboardContentType, caseRole:ClaimantOrDefendant, redisKey:string) => {
  try{
    if(redisKey?.length) {
      await app.locals.draftStoreClient.set(caseRole+dashboardContentType+redisKey, JSON.stringify(lists));
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};

export const getDashboardContentTypeFromCache = async (caseRole:ClaimantOrDefendant, dashboardContentType: DashboardContentType,redisKey:string): Promise<Dashboard | DashboardNotificationList> => {
  try{
    const data = await app.locals.draftStoreClient.get(caseRole+dashboardContentType+redisKey);
    if(data) {
      const jsonData = JSON.parse(data);
      if (dashboardContentType == DashboardContentType.DASHBOARD) {
        const dashboardItems= plainToInstance(DashboardTaskList, jsonData as object[]);
        return new Dashboard(dashboardItems);
      } else {
        const notificationItems = plainToInstance(DashboardNotification, jsonData as object[]);
        return new DashboardNotificationList(notificationItems);
      }
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};

export const saveDashboardToCache = async (dashboard: Dashboard,caseRole:ClaimantOrDefendant,redisKey:string) => {
  await saveDashboardContentTypeToCache(dashboard, DashboardContentType.DASHBOARD, caseRole, redisKey);
};

export const getDashboardFromCache = async (caseRole:ClaimantOrDefendant,redisKey:string): Promise<Dashboard> => {
  return await getDashboardContentTypeFromCache(caseRole, DashboardContentType.DASHBOARD, redisKey) as Dashboard;
};

export const getNotificationFromCache = async (caseRole:ClaimantOrDefendant,redisKey:string): Promise<DashboardNotificationList> => {
  return await getDashboardContentTypeFromCache(caseRole, DashboardContentType.NOTIFICATION, redisKey) as DashboardNotificationList;
};

export const saveNotificationToCache = async (notificationList: DashboardNotificationList, caseRole:ClaimantOrDefendant, redisKey:string) => {
  await saveDashboardContentTypeToCache(notificationList, DashboardContentType.NOTIFICATION, caseRole, redisKey);
};
