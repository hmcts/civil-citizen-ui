import {app} from '../../app';
import {CourtLocation} from 'models/courts/courtLocations';
import {plainToInstance} from 'class-transformer';

const courtLocationKey = 'courtLocations';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('courtLocationCache');

const saveCourtLocationsToCache = async (courLocations: CourtLocation[]) => {
  if(courLocations?.length) {
    await app.locals.draftStoreClient.set(courtLocationKey, JSON.stringify(courLocations));
  }
};

const deleteCourtLocationsFromCache = async () => {
  await app.locals.draftStoreClient.del(courtLocationKey);
};

const getCourtLocationsFromCache = async (): Promise<CourtLocation[]> => {
  try{
    const data = await app.locals.draftStoreClient.get(courtLocationKey);
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
  deleteCourtLocationsFromCache,
};
