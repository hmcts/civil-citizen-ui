import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {ResponseDeadlineService} from '../../../../../main/services/features/response/responseDeadlineService';
import {ResponseOptions} from '../../../../../main/common/form/models/responseDeadline';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockClaim} from '../../../../utils/mockClaim';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const responseDeadlineService = new ResponseDeadlineService();

describe('Response Deadline Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  describe('saveDeadlineResponse', () => {
    it('should save successfully if deadline response object is not defined', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await responseDeadlineService.saveDeadlineResponse('validClaimId', ResponseOptions.NO);
      expect(spySave).toBeCalled();
    });

    it('should save successfully if deadline response object is defined', async () => {
      const claim = new Claim();
      claim.responseDeadline = {
        option: undefined,
      };
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await responseDeadlineService.saveDeadlineResponse('validClaimId', ResponseOptions.YES);
      expect(spySave).toBeCalled();
    });

    it('should save successfully for valid response option', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await responseDeadlineService.saveDeadlineResponse('validClaimId', ResponseOptions.ALREADY_AGREED);
      expect(spySave).toBeCalled();
    });

    it('should save successfully for valid response option', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await responseDeadlineService.saveDeadlineResponse('validClaimId', ResponseOptions.REQUEST_REFUSED);
      expect(spySave).toBeCalled();
    });

    it('should fail when redis throws an error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementationOnce(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await expect(responseDeadlineService.saveDeadlineResponse('validClaimId', ResponseOptions.NO))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('getAgreedResponseDeadline', () => {
    it('should return undefined when empty claim retrieved', async () => {
      // Given
      const claim = new Claim();
      // When 
      const agreedResponseDeadline = responseDeadlineService.getAgreedResponseDeadline(claim);
      // Then
      expect(agreedResponseDeadline).toBeUndefined();
    });

    it('should return agreedResponseDeadline when date retrieved', async () => {
      // Given
      const mockAgreedResponseDeadline = new Date('2022-05-15T02:59:59');
      const claim = new Claim();
      claim.responseDeadline = {agreedResponseDeadline: mockAgreedResponseDeadline};
      // When
      const agreedResponseDeadline = responseDeadlineService.getAgreedResponseDeadline(claim);
      // Then
      expect(agreedResponseDeadline).not.toBeNull();
      expect(agreedResponseDeadline.date).toEqual(mockAgreedResponseDeadline);
      expect(agreedResponseDeadline.year).toEqual(mockAgreedResponseDeadline.getFullYear());
      expect(agreedResponseDeadline.month).toEqual(mockAgreedResponseDeadline.getMonth() + 1);
      expect(agreedResponseDeadline.day).toEqual(mockAgreedResponseDeadline.getDate());
    });
  });

  describe('saveAgreedResponseDeadline', () => {
    const mockAgreedResponseDeadline = new Date('2022-01-24T15:59:59');
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should save successfully if deadline response object is not defined', async () => {
      // Given
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      // When
      await responseDeadlineService.saveAgreedResponseDeadline('validClaimId', mockAgreedResponseDeadline);
      // Then
      expect(spySave).toBeCalled();
    });

    it('should save successfully if deadline response object is defined', async () => {
      // Given
      const claim = new Claim();
      claim.responseDeadline = {
        agreedResponseDeadline: undefined,
      };
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      // When
      await responseDeadlineService.saveAgreedResponseDeadline('validClaimId', mockAgreedResponseDeadline);
      // Then
      expect(spySave).toBeCalled();
    });

    it('should save successfully for valid agreed response deadline', async () => {
      // Given
      const claim = new Claim();
      claim.responseDeadline = {
        agreedResponseDeadline: new Date('2022-01-01T00:00:00.000Z'),
      };
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      // When
      await responseDeadlineService.saveAgreedResponseDeadline('validClaimId', mockAgreedResponseDeadline);
      // Then
      expect(spySave).toBeCalled();
    });

    it('should fail when redis throws an error', async () => {
      // Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      // When
      mockSaveDraftClaim.mockImplementationOnce(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      // Then
      await expect(responseDeadlineService.saveAgreedResponseDeadline('validClaimId', mockAgreedResponseDeadline))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
