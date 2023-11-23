import {app} from '../../app';
import {plainToInstance} from 'class-transformer';
import {TaskList} from 'models/taskList/taskList';
import {Dashboard} from 'models/caseProgression/dashboard';
import {ClaimantOrDefendant} from 'models/partyType';

const dashboardKey = 'dashboard';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');

export const saveDashboardToCache = async (taskLists: TaskList[],caseRole:ClaimantOrDefendant,redisKey:string) => {
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
    const data = await app.locals.draftStoreClient.get(caseRole+dashboardKey+redisKey);
    if(data) {
      const jsonData = JSON.parse(data);
      return plainToInstance(Dashboard, jsonData as object);
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};
