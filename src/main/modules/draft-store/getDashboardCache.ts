import {app} from '../../app';
import {TaskList} from 'models/taskList/taskList';
import {Dashboard} from 'models/caseProgression/dashboard';
import {ClaimantOrDefendant} from 'models/partyType';
import {DashboardContentType} from 'models/dashboardContentType';
import {Notifications} from 'models/caseProgression/notifications';
import {DashboardNotification} from 'common/utils/dashboard/dashboardNotification';
import {plainToInstance} from 'class-transformer';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');

export const saveDashboardContentTypeToCache = async (lists: TaskList[] | DashboardNotification[], dashboardContentType: DashboardContentType, caseRole:ClaimantOrDefendant,redisKey:string) => {
  try{
    if(redisKey?.length) {
      await app.locals.draftStoreClient.set(caseRole+dashboardContentType+redisKey, JSON.stringify(lists));
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};

export const getDashboardContentTypeFromCache = async (caseRole:ClaimantOrDefendant, dashboardContentType: DashboardContentType,redisKey:string): Promise<Dashboard | Notifications> => {
  try{
    const data = await app.locals.draftStoreClient.get(caseRole+dashboardContentType+redisKey);
    if(data) {
      const jsonData = JSON.parse(data);
      if (dashboardContentType == DashboardContentType.DASHBOARD) {
        const dashboardItems= plainToInstance(TaskList, jsonData as object[]);
        return new Dashboard(dashboardItems);
      } else {
        const notificationItems = plainToInstance(DashboardNotification, jsonData as object[]);
        return new Notifications(notificationItems);
      }
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};

export const saveDashboardToCache = async (taskLists: TaskList[],caseRole:ClaimantOrDefendant,redisKey:string) => {
  await saveDashboardContentTypeToCache(taskLists, DashboardContentType.DASHBOARD, caseRole, redisKey);
};

export const getDashboardFromCache = async (caseRole:ClaimantOrDefendant,redisKey:string): Promise<Dashboard> => {
  return await getDashboardContentTypeFromCache(caseRole, DashboardContentType.DASHBOARD, redisKey) as Dashboard;
};

export const getNotificationFromCache = async (caseRole:ClaimantOrDefendant,redisKey:string): Promise<Notifications> => {
  return await getDashboardContentTypeFromCache(caseRole, DashboardContentType.NOTIFICATION, redisKey) as Notifications;
};

export const saveNotificationToCache = async (notificationLists: DashboardNotification[],caseRole:ClaimantOrDefendant,redisKey:string) => {
  await saveDashboardContentTypeToCache(notificationLists, DashboardContentType.NOTIFICATION, caseRole, redisKey);
};
