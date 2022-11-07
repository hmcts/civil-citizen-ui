import {AppRequest} from 'models/AppRequest';
import {CourtLocation} from 'models/courts/courtLocations';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {getDirectionQuestionnaire} from '../directionQuestionnaireService';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {getCourtLocationsFromCache} from 'modules/draft-store/courtLocationCache';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');

const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const getSpecificCourtLocationForm = async (claimId: string) => {
  const directionQuestionnaire = await getDirectionQuestionnaire(claimId);
  return directionQuestionnaire.hearing?.specificCourtLocation? directionQuestionnaire.hearing?.specificCourtLocation : new SpecificCourtLocation();
};

const getListOfCourtLocations = async (req: AppRequest): Promise<CourtLocation[]> =>{
  const cachedCourtLocations = getCourtLocationsFromCache();
  if(!cachedCourtLocations) {
    const courtLocations = await civilServiceClient.getCourtLocations(req);
    await saveCourtLocationsToCache(courtLocations);
    return courtLocations;
  }
  return cachedCourtLocations;
};

const saveCourtLocationsToCache = async (courtLocations: CourtLocation[]) => {
  if(courtLocations?.length){
    await saveCourtLocationsToCache(courtLocations);
  }
};

export {
  getSpecificCourtLocationForm,
  getListOfCourtLocations,
};
