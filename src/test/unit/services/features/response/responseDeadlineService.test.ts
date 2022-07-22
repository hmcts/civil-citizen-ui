import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {ResponseDeadlineService} from '../../../../../main/services/features/response/responseDeadlineService';
import {ResponseOptions} from '../../../../../main/common/form/models/responseDeadline';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {AdditionalTimeOptions} from '../../../../../main/common/form/models/additionalTime';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const responseDeadlineService = new ResponseDeadlineService();

describe('Response Deadline Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  describe('saveDeadlineResponse', () => {
    const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

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

      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await expect(responseDeadlineService.saveDeadlineResponse('validClaimId', ResponseOptions.NO))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    afterAll(() => {
      mockSaveDraftClaim.mockRestore();
    });
  });

  describe('getAdditionalTime', () => {
    it('should return valid option if "more-than-28-days"', () => {
      expect(responseDeadlineService.getAdditionalTime('more-than-28-days'))
        .toEqual(AdditionalTimeOptions.MORE_THAN_28_DAYS);
    });

    it('should return valid option if "up-to28-days"', () => {
      expect(responseDeadlineService.getAdditionalTime('up-to-28-days'))
        .toEqual(AdditionalTimeOptions.UP_TO_28_DAYS);
    });

    it('should return undefined if invalid string is provided', () => {
      expect(responseDeadlineService.getAdditionalTime('blah'))
        .toBeUndefined();
    });
  });

  describe('saveAdditionalTime', () => {
    it('should save successfully if additional time object is not defined', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await responseDeadlineService.saveAdditionalTime('validClaimId', AdditionalTimeOptions.UP_TO_28_DAYS);
      expect(spySave).toBeCalled();
    });

    it('should save successfully if additional time object is defined', async () => {
      const claim = new Claim();
      claim.responseDeadline = {
        option: undefined,
        additionalTime: undefined,
      };
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await responseDeadlineService.saveAdditionalTime('validClaimId', AdditionalTimeOptions.MORE_THAN_28_DAYS);
      expect(spySave).toBeCalled();
    });

    it('should save successfully for valid additional time', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await responseDeadlineService.saveAdditionalTime('validClaimId', AdditionalTimeOptions.MORE_THAN_28_DAYS);
      expect(spySave).toBeCalled();
    });

    it('should save successfully for valid additional time', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await responseDeadlineService.saveAdditionalTime('validClaimId', AdditionalTimeOptions.UP_TO_28_DAYS);
      expect(spySave).toBeCalled();
    });

    it('should fail when redis throws an error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await expect(responseDeadlineService.saveAdditionalTime('validClaimId', AdditionalTimeOptions.UP_TO_28_DAYS))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
