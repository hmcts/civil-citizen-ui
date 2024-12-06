import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

import {
  getClaimDetails,
  saveClaimDetails,
} from '../../../../../../main/services/features/claim/details/claimDetailsService';
import {Reason} from '../../../../../../main/common/form/models/claim/details/reason';
import {ClaimDetails} from '../../../../../../main/common/form/models/claim/details/claimDetails';
import {Evidence} from '../../../../../../main/common/form/models/evidence/evidence';
import {EvidenceItem} from '../../../../../../main/common/form/models/evidence/evidenceItem';
import {EvidenceType} from '../../../../../../main/common/models/evidence/evidenceType';

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

    describe('GET Evidence', () => {
      it('should return undefined if claimDetails is not set', async () => {
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return new Claim();
        });
        const claimDetails = await getClaimDetails('validClaimId');
        expect(claimDetails?.evidence).toBeUndefined();
      });

      it('should return claimDetails object with evidence', async () => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.evidence = new Evidence('', [
          new EvidenceItem(EvidenceType.EXPERT_WITNESS, 'Describe evidence...'),
          new EvidenceItem(EvidenceType.CORRESPONDENCE, 'Describe evidence...'),
          new EvidenceItem(EvidenceType.EXPERT_WITNESS, 'Describe evidence...'),
          new EvidenceItem(EvidenceType.OTHER, 'Describe evidence...'),
          new EvidenceItem(EvidenceType.PHOTO, 'Describe evidence...'),
          new EvidenceItem(EvidenceType.RECEIPTS, 'Describe evidence...'),
          new EvidenceItem(EvidenceType.STATEMENT_OF_ACCOUNT, 'Describe evidence...'),
        ]);

        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        const claimDetails = await getClaimDetails('validClaimId');

        expect(claimDetails?.evidence?.evidenceItem?.length).toBe(7);
      });
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
      expect(spySave).toHaveBeenCalledWith('validClaimId', {refreshDataForDJ: true, claimDetails});
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
      expect(spySave).toHaveBeenCalledWith('validClaimId', {refreshDataForDJ: true, claimDetails});
    });

    describe('POST Evidence', () => {
      it('should save evidence data successfully when claim exists', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimDetails = new ClaimDetails();
          return claim;
        });

        const eventItems: EvidenceItem[] = [];
        eventItems.push({ type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: 'Test evidence details' });
        eventItems.push({ type: EvidenceType.EXPERT_WITNESS, description: 'Test evidence details' });
        eventItems.push({ type: EvidenceType.RECEIPTS, description: 'Test evidence details' });
        eventItems.push({ type: EvidenceType.STATEMENT_OF_ACCOUNT, description: 'Test evidence details' });
        eventItems.push({ type: EvidenceType.OTHER, description: 'Test evidence details' });
        claimDetails.evidence = new Evidence('', eventItems);
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        //When
        await saveClaimDetails('validClaimId', new Evidence(
          '',
          eventItems,
        ), 'evidence');
        //Then
        expect(spySave).toBeCalled();
      });
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
