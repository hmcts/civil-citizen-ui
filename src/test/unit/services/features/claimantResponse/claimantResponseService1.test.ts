import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {ClaimantResponse} from '../../../../../main/common/models/claimantResponse';
import {CCJRequest} from '../../../../../main/common/models/claimantResponse/ccj/ccjRequest';
import {
  getClaimantResponse,
} from '../../../../../main/services/features/claimantResponse/claimantResponseService';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
//const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
//const languageMock = getLng as jest.Mock;
const REDIS_FAILURE = 'Redis DraftStore failure.';

describe('Claimant Response Service', () => {
  describe('getClaimantResponse', () => {
    it('should return undefined if direction claimant response is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const claimantResponse = await getClaimantResponse('validClaimId');
      expect(claimantResponse?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Response object', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Response object with hasDefendantPaidYou no', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasDefendantPaidYou = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou.option).toBe(YesNo.NO);
    });

    it('should return Claimant Response object with hasDefendantPaidYou yes', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasDefendantPaidYou = {
        option: YesNo.YES,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou.option).toBe(YesNo.YES);
    });

    describe('intentionToProceed', () => {
      it('should return undefined if intention to proceed is not set', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return new Claim();
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.intentionToProceed).toBeUndefined();
      });

      it('should return Claimant Response object', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        expect(claimantResponse).toBeDefined();
        //Then
        expect(claimantResponse?.intentionToProceed).toBeUndefined();
      });

      it('should return Claimant Response object with intentionToProceed no', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.intentionToProceed = {
          option: YesNo.NO,
        };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.intentionToProceed.option).toBe(YesNo.NO);
      });

      it('should return Claimant Response object with intentionToProceed yes', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.intentionToProceed = {
          option: YesNo.YES,
        };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.intentionToProceed.option).toBe(YesNo.YES);
      });
    });

    describe('CCJ-Defendant date of birth', () => {
      it('should return undefined if defendant dob is not set', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return new Claim();
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest?.defendantDOB).toBeUndefined();
      });

      it('should return Claimant Response object', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse).toBeDefined();
        expect(claimantResponse.ccjRequest?.defendantDOB).toBeUndefined();
      });

      it('should return Claimant Response object with ccj request', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse).toBeDefined();
        expect(claimantResponse.ccjRequest).toBeDefined();
        expect(claimantResponse.ccjRequest.defendantDOB).toBeUndefined();
      });

      it('should return Claimant Response object with "no" option', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.defendantDOB = {option: YesNo.NO};
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest.defendantDOB.option).toBe(YesNo.NO);
        expect(claimantResponse?.ccjRequest.defendantDOB.dob).toBeUndefined();
      });

      it('should return Claimant Response object with dob details with option yes', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.defendantDOB = {
          option: YesNo.NO,
          dob: {dateOfBirth: new Date('2000-11-11T00:00:00.000Z')},
        };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest.defendantDOB.option).toBe(YesNo.NO);
        expect(claimantResponse?.ccjRequest.defendantDOB.dob.dateOfBirth.toDateString()).toBe('Sat Nov 11 2000');
      });
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });

      await expect(getClaimantResponse('claimId')).rejects.toThrow(REDIS_FAILURE);
    });
  });
});
