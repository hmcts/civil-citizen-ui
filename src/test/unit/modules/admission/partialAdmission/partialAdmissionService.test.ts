import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {PartialAdmissionService} from '../../../../../main/modules/admission/partialAdmission/partialAdmissionService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const partialAdmissionService = new PartialAdmissionService();

describe('partial admission service', () => {
  describe('claim already paid', () => {
    describe('get claim already paid',  () => {
      it('should return undefined if already paid is not set', async () => {
        // Given
        mockGetCaseData.mockImplementation(async () => {
          return new Claim();
        });
        // When
        const alreadyPaid = await partialAdmissionService.getClaimAlreadyPaid('validClaimId');
        // Then
        expect(alreadyPaid).toBeUndefined();
      });

      it('should get a boolean value if already paid is set to true', async () => {
        // Given
        const claim = new Claim();
        claim.claimAlreadyPaid = true;
        mockGetCaseData.mockImplementation(async () => {
          return claim;
        });
        // When
        const alreadyPaid = await partialAdmissionService.getClaimAlreadyPaid('validClaimId');
        // Then
        expect(alreadyPaid).toBe(true);
      });

      it('should get a boolean value if already paid is set to false', async () => {
        // Given
        const claim = new Claim();
        claim.claimAlreadyPaid = false;
        mockGetCaseData.mockImplementation(async () => {
          return claim;
        });
        // When
        const alreadyPaid = await partialAdmissionService.getClaimAlreadyPaid('validClaimId');
        // Then
        expect(alreadyPaid).toBe(false);
      });
    });

    describe('save claim already paid', () => {
      it('should save successfully when already paid is not previously set', async () => {
        // Given
        mockGetCaseData.mockImplementation(async () => {
          return new Claim();
        });
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        // When
        await partialAdmissionService.saveClaimAlreadyPaid('validClaimId', true);
        // Then
        expect(spySave).toBeCalled();
      });

      it('should save successfully when already paid is previously set', async () => {
        // Given
        const claim = new Claim();
        claim.claimAlreadyPaid = false;
        mockGetCaseData.mockImplementation(async () => {
          return claim;
        });
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        // When
        await partialAdmissionService.saveClaimAlreadyPaid('validClaimId', true);
        // Then
        expect(spySave).toBeCalled();
      });

      it('should throw an error when redis throws an error', async () => {
        // Given
        mockGetCaseData.mockImplementation(async () => {
          return new Claim();
        });
        const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
        mockSaveDraftClaim.mockImplementation(async () => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });
        // Then
        await expect(partialAdmissionService.saveClaimAlreadyPaid('validClaimId', false)).rejects.toThrow(TestMessages.REDIS_FAILURE);
      });
    });
  });
});
