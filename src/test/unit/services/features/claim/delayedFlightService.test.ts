import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {
  deleteDelayedFlight,
  getDelayedFlight, 
  getFlightDetails, 
  saveDelayedFlight, 
  saveFlightDetails,
} from 'services/features/claim/delayedFlightService';
import {YesNo} from 'common/form/models/yesNo';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {FlightDetails} from 'common/models/flightDetails';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Delayed Flight Service', () => {
  const claimId = '123';
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getDelayedFlight', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getDelayedFlight(claimId);
      //Then
      expect(form.option).toBeUndefined();
    });

    it('should return populated form when delayed flight exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.delayedFlight = new GenericYesNo(YesNo.YES);
        return claim;
      });
      //When
      const form = await getDelayedFlight(claimId);
      //Then
      expect(form.option).toEqual(YesNo.YES);
    });

    it('should rethrow error when error occurs', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getDelayedFlight(claimId)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('getFlightDetails', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getFlightDetails(claimId);
      //Then
      expect(form.airline).toBeUndefined();
      expect(form.flightNumber).toBeUndefined();
      expect(form.flightDate).toBeUndefined();
    });

    it('should return populated form when delayed flight exists', async () => {
      //Given
      const flightDetails = new FlightDetails('airline', '123456', '2023', '9', '29');
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.flightDetails = flightDetails;
        return claim;
      });
      //When
      const form = await getFlightDetails('123');
      //Then
      expect(form).toMatchObject(flightDetails);
    });

    it('should rethrow error when error occurs', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getFlightDetails(claimId)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveDelayedFlight', () => {
    it('should save delayedFlight', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      await saveDelayedFlight(claimId, new GenericYesNo(YesNo.YES));
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
    });
    it('should throw an error', async () => {
      //Given
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveDelayedFlight(claimId, new GenericYesNo(YesNo.YES))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveFlightDetails', () => {
    const flightDetails = new FlightDetails('airline', '123456', '2023', '9', '29');
    it('should save flightDetails', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      await saveFlightDetails(claimId, flightDetails);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
    });
    it('should throw an error', async () => {
      //Given
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveFlightDetails(claimId, flightDetails)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('deleteDelayedFlight', () => {
    it('should delete delayed flight', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      await deleteDelayedFlight(claimId);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
    });
    it('should throw an error', async () => {
      //Given
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(deleteDelayedFlight(claimId)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
