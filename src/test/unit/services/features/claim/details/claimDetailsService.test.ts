import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

import {
  getClaimDetails,
  saveClaimDetails,
} from '../../../../../../main/services/features/claim/details/claimDetailsService';
import {Reason} from '../../../../../../main/common/form/models/claim/details/reason';
import {ClaimDetails} from '../../../../../../main/common/form/models/claim/details/claimDetails';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Claim Details Service', () => {
  describe('getClaimDetails', () => {
    it('should return undefined if claimDetails is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const claimDetails = await getClaimDetails('validClaimId');
      expect(claimDetails?.reason).toBeUndefined();
    });

    it('should return claimDetails object with reason', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.reason = {
        text: 'reason',
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimDetails = await getClaimDetails('validClaimId');

      expect(claimDetails?.reason?.text).toBe('reason');
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getClaimDetails('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimDetails', () => {
    const claimDetails = new ClaimDetails();
    claimDetails.reason = new Reason('reason');

    it('should save claim details successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        return claim;
      });
      claimDetails.reason = new Reason('reason');
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveClaimDetails('validClaimId', claimDetails?.reason, 'reason');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {claimDetails});
    });

    it('should update reason successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        return claim;
      });
      claimDetails.reason = new Reason('updatedReason');

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveClaimDetails('validClaimId', claimDetails?.reason, 'reason');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {claimDetails});
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveClaimDetails('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
