import {app} from '../../app';
import {CourtLocation} from 'models/courts/courtLocations';
import {plainToInstance} from 'class-transformer';

const draftStoreClient = app.locals.draftStoreClient;
const courtLocationKey = 'courtLocations';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('courtLocationCache');

const saveCourtLocationsToCache = async (courLocations: CourtLocation[]) => {
  if(courLocations?.length) {
    await draftStoreClient.set(courtLocationKey, JSON.stringify(courLocations));
  }
};

const getCourtLocationsFromCache = async (): Promise<CourtLocation[]> => {
  try{
    const data = draftStoreClient.get(courtLocationKey);
    if(data) {
      const jsonData = JSON.parse(data);
      return plainToInstance(CourtLocation, jsonData as object[]);
    }
  }catch(error){
    logger.error(error);
    throw error;
  }
};

export {
  getCourtLocationsFromCache,
  saveCourtLocationsToCache,
};
