import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  getBreathingSpace,
  saveBreathingSpace,
} from 'services/features/breathingSpace/breathingSpaceService';

import {BreathingSpace} from 'models/breathingSpace';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {DebtRespiteOptionType} from 'models/breathingSpace/debtRespiteOptionType';
import {DebtRespiteReferenceNumber} from 'models/breathingSpace/debtRespiteReferenceNumber';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

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

    it('should return Breathing Space object with DebtRespiteReferenceNumber', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.breathingSpace = {
        debtRespiteReferenceNumber: {
          referenceNumber: '1234',
        },
      };

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const breathingSpace = await getBreathingSpace('validClaimId');

      expect(breathingSpace?.debtRespiteReferenceNumber.referenceNumber).toBe('1234');
    });

    it('should return Breathing Space object with DebtRespiteReferenceNumber empty', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.breathingSpace = {
        debtRespiteReferenceNumber: {
        },
      };

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const breathingSpace = await getBreathingSpace('validClaimId');

      expect(breathingSpace?.debtRespiteReferenceNumber.referenceNumber).toBeUndefined();
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
      expect(spySave).toHaveBeenCalledWith('validClaimId', breathingSpaceToSave, true);
    });

    it('should update breathing space debtRespiteOption successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.breathingSpace = breathingSpace;
        claim.claimDetails.breathingSpace.debtRespiteReferenceNumber = undefined;
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
      expect(spySave).toHaveBeenCalledWith('validClaimId', breathingSpaceToSave, true);
    });

    describe('debtRespiteReferenceNumber', () => {
      breathingSpace.debtRespiteReferenceNumber = new DebtRespiteReferenceNumber('0000');
      it('should save debt respite reference number successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimDetails = new ClaimDetails();
          claim.claimDetails.breathingSpace = new BreathingSpace();
          return claim;
        });
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        const debtRespiteReferenceNumberValue = new DebtRespiteReferenceNumber('1234');
        const breathingSpaceToSave = {
          claimDetails: {
            breathingSpace: {
              debtRespiteReferenceNumber: {referenceNumber: '1234'},
            }},
        };
        //When
        await saveBreathingSpace('validClaimId', debtRespiteReferenceNumberValue, 'debtRespiteReferenceNumber');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', breathingSpaceToSave, true);
      });

      it('should update debt respite scheme successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimDetails = new ClaimDetails();
          claim.claimDetails.breathingSpace = breathingSpace;
          return claim;
        });
        const breathingSpaceToUpdate = {
          claimDetails: {
            breathingSpace: {
              debtRespiteReferenceNumber: {referenceNumber: '1234'},
            }},
        };
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        //When
        await saveBreathingSpace('validClaimId', breathingSpace?.debtRespiteReferenceNumber, 'debtRespiteReferenceNumber');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', breathingSpaceToUpdate, true);
      });
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
