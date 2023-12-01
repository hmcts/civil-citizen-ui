import {app} from '../../app';
import {plainToInstance} from 'class-transformer';
import {TaskList} from 'models/taskList/taskList';
import {Dashboard} from 'models/caseProgression/dashboard';
import {ClaimantOrDefendant} from 'models/partyType';
import {DashboardContentType} from 'models/dashboardContentType';
import {Notifications} from 'models/caseProgression/notifications';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');

export const saveDashboardToCache = async (taskLists: TaskList[],caseRole:ClaimantOrDefendant,dashboardKey:DashboardContentType,redisKey:string) => {
  try{
    if(redisKey?.length) {
      await app.locals.draftStoreClient.set(caseRole+dashboardKey+redisKey, JSON.stringify(taskLists));
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};

export const getDashboardFromCache = async (caseRole:ClaimantOrDefendant,redisKey:string): Promise<Dashboard> => {
  try{
    const data = await app.locals.draftStoreClient.get(caseRole+DashboardContentType.DASHBOARD+redisKey);
    if(data) {
      const jsonData = JSON.parse(data);
      return plainToInstance(Dashboard, jsonData as object);
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};
//TODO could we try to have a generic get for getNotificationFromCache and getDashboardFromCache
export const getNotificationFromCache = async (caseRole:ClaimantOrDefendant,redisKey:string): Promise<Notifications> => {
  try{
    const data = await app.locals.draftStoreClient.get(caseRole+DashboardContentType.NOTIFICATION+redisKey);
    if(data) {
      const jsonData = JSON.parse(data);
      return plainToInstance(Notifications, jsonData as object);
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};
