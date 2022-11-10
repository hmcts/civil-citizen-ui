import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  getBreathingSpace,
  saveBreathingSpace,
} from '../../../../../main/services/features/breathingSpace/breathingSpaceService';

import {BreathingSpace} from '../../../../../main/common/models/breathingSpace';
import {ClaimDetails} from '../../../../../main/common/form/models/claim/details/claimDetails';
import {DebtRespiteOptionType} from '../../../../../main/common/models/breathingSpace/debtRespiteOptionType';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

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

    it('should return Claimant Response object with debtRespiteOption MENTAL_HEALTH', async () => {
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
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getBreathingSpace('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimantResponse', () => {
    const breathingSpace = new BreathingSpace();
    breathingSpace.debtRespiteOption= {
      type: DebtRespiteOptionType.STANDARD,
    };

    it('should save breathing space successfully', async () => {
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

    it('should update breathing space successfully', async () => {
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
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await expect(saveBreathingSpace('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
