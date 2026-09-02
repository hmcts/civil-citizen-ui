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
import {AppRequest} from 'models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockReq = {
  session: {
    user: {id: '123'},
    draftId: 'draft-123',
  },
} as unknown as AppRequest;

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'draft-123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete delayed flight via the manager', async () => {
      const claim = new Claim();
      claim.delayedFlight = new GenericYesNo(YesNo.YES);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      await deleteDelayedFlight(mockReq);

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(mockUpdateDraftClaim).toHaveBeenCalledTimes(1);
      const savedClaim = mockUpdateDraftClaim.mock.calls[0][1] as Claim;
      expect(mockUpdateDraftClaim.mock.calls[0][0]).toBe(mockReq);
      expect(mockUpdateDraftClaim.mock.calls[0][2]).toBe('draft-123');
      expect(savedClaim.delayedFlight).toBeUndefined();
      expect(savedClaim.flightDetails).toBeUndefined();
      expect(savedClaim.draftClaimCreatedAt).toEqual(new Date('2026-08-01T10:00:00.000Z'));
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(deleteDelayedFlight(mockReq)).rejects.toThrow('[delayedFlightService] no draft claim found');
    });

    it('should throw when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(deleteDelayedFlight(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
