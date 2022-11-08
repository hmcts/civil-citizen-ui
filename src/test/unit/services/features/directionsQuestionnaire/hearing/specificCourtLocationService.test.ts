import * as cache from 'modules/draft-store/courtLocationCache';

import {CourtLocation} from 'models/courts/courtLocations';
import {getListOfCourtLocations} from 'services/features/directionsQuestionnaire/hearing/specificCourtLocationService';
import * as requestModels from 'models/AppRequest';
import nock from 'nock';
import config from 'config';
import {CIVIL_SERVICE_COURT_LOCATIONS} from 'client/civilServiceUrls';

const civilServiceUrl = config.get<string>('services.civilService.url');

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/courtLocationCache');

const getCachedLocations = cache.getCourtLocationsFromCache as jest.Mock;

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;

describe('specific court location service test', ()=> {
  describe('getListOfCourtLocations', ()=>{
    it('should return cached court locations when data exists in cache', async ()=> {
      //Given
      const cachedData = [new CourtLocation('1', 'location1'), new CourtLocation('2', 'location2')];
      getCachedLocations.mockImplementation( async ()=> {
        return cachedData;
      });
      //When
      const locations = await getListOfCourtLocations(mockedAppRequest);
      //Then
      expect(locations).toEqual(cachedData);
    });
    it('should cache locations and return locations from api call when data does not exist in the cache', async () =>{
      //Given
      getCachedLocations.mockImplementation( async ()=> {
        return [];
      });
      const apiData =[new CourtLocation('1', 'location1'), new CourtLocation('2', 'location2')];
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_COURT_LOCATIONS)
        .reply(200, apiData);
      const spy = jest.spyOn(cache, 'saveCourtLocationsToCache');
      //When
      const locations = await getListOfCourtLocations(mockedAppRequest);
      //Then
      expect(locations.length).toEqual(2);
      expect(locations[0].code).toEqual(apiData[0].code);
      expect(locations[0].label).toEqual(apiData[0].label);
      expect(locations[1].code).toEqual(apiData[1].code);
      expect(locations[1].label).toEqual(apiData[1].label);
      expect(spy).toBeCalled();
    });
  });
});
