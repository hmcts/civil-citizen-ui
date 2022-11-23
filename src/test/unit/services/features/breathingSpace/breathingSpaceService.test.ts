import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {
  getBreathingSpace,
  saveBreathingSpace,
} from 'services/features/breathingSpace/breathingSpaceService';

import {BreathingSpace} from 'common/models/breathingSpace';
import {ClaimDetails} from 'common/form/models/claim/details/claimDetails';
import {DebtRespiteOptionType} from 'common/models/breathingSpace/debtRespiteOptionType';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const REDIS_FAILURE = 'Redis DraftStore failure.';

describe('Breathing Space Service', () => {
  describe('getBreathingSpace', () => {
    it('should return undefined if breathing space is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const breathingSpace = await getBreathingSpace('validClaimId');
      expect(breathingSpace?.debtRespiteOption).toBeUndefined();
    });

    it('should return Breathing Space object', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.breathingSpace = new BreathingSpace();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const breathingSpace = await getBreathingSpace('validClaimId');

      expect(breathingSpace?.debtRespiteOption).toBeUndefined();
    });

    it('should return Breathing Space object with debtRespiteOption STANDARD', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.breathingSpace = {
        debtRespiteOption: {
          type: DebtRespiteOptionType.STANDARD,
        },
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const breathingSpace = await getBreathingSpace('validClaimId');

      expect(breathingSpace?.debtRespiteOption.type).toBe(DebtRespiteOptionType.STANDARD);
    });

    it('should return Breathing Space object with debtRespiteOption MENTAL_HEALTH', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.breathingSpace = {
        debtRespiteOption: {
          type: DebtRespiteOptionType.MENTAL_HEALTH,
        },
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const breathingSpace = await getBreathingSpace('validClaimId');

      expect(breathingSpace?.debtRespiteOption.type).toBe(DebtRespiteOptionType.MENTAL_HEALTH);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });

      await expect(getBreathingSpace('claimId')).rejects.toThrow(REDIS_FAILURE);
    });
  });

  describe('saveBreathingSpace', () => {
    const breathingSpace = new BreathingSpace();
    breathingSpace.debtRespiteOption= {
      type: DebtRespiteOptionType.STANDARD,
    };

    it('should save breathing space debtRespiteOption successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.breathingSpace = new BreathingSpace();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const breathingSpaceToSave = {
        claimDetails: {
          breathingSpace: {
            debtRespiteOption: {
              type: DebtRespiteOptionType.STANDARD,
            },
          }},
      };
      await saveBreathingSpace('validClaimId', breathingSpace?.debtRespiteOption, 'debtRespiteOption');
      expect(spySave).toHaveBeenCalledWith('validClaimId', breathingSpaceToSave);
    });

    it('should update breathing space debtRespiteOption successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.breathingSpace = breathingSpace;
        return claim;
      });
      const breathingSpaceUpdate = new BreathingSpace();
      breathingSpaceUpdate.debtRespiteOption= {
        type: DebtRespiteOptionType.MENTAL_HEALTH,
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const breathingSpaceToSave = {
        claimDetails: {
          breathingSpace: {
            debtRespiteOption: {
              type: DebtRespiteOptionType.MENTAL_HEALTH,
            },
          }},
      };
      await saveBreathingSpace('validClaimId', breathingSpaceUpdate?.debtRespiteOption, 'debtRespiteOption');
      expect(spySave).toHaveBeenCalledWith('validClaimId', breathingSpaceToSave);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });
      await expect(saveBreathingSpace('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(REDIS_FAILURE);
    });
  });
});
