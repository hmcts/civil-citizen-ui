import {app} from '../../app';
import {plainToInstance} from 'class-transformer';
import {TaskList} from 'models/taskList/taskList';
import {Dashboard} from 'models/caseProgression/dashboard';

const dashboardKey = 'dashboard';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');

const saveDashboardToCache = async (taskLists: TaskList[],redisKey:string) => {
  try{
    if(redisKey?.length) {
      await app.locals.draftStoreClient.set(dashboardKey+redisKey, JSON.stringify(taskLists));
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};

const getDashboardFromCache = async (redisKey:string): Promise<Dashboard> => {
  try{
    const data = await app.locals.draftStoreClient.get(dashboardKey+redisKey);
    if(data) {
      const jsonData = JSON.parse(data);
      return plainToInstance(Dashboard, jsonData as object);
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};

export {
  saveDashboardToCache,
  getDashboardFromCache,
};
