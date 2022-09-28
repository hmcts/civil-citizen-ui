import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';
import {
  getPermissionForExpert,
  savePermissionForExpert,
} from '../../../../../main/services/features/directionsQuestionnaire/permissionForExpertService';
import {Experts} from '../../../../../main/common/models/directionsQuestionnaire/experts/experts';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Tried to Settle the Claim Service', () => {
  describe('getPermissionForExpert', () => {
    it('should return permission for expert object with undefined option', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const triedToSettle = await getPermissionForExpert('validClaimId');
      expect(triedToSettle.option).toBeUndefined();
    });

    it('should return permission for expert option with Yes option', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const triedToSettle = await getPermissionForExpert('validClaimId');
      expect(triedToSettle.option).toBe(YesNo.YES);
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getPermissionForExpert('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('savePermissionForExpert', () => {
    const permissionForExpert: GenericYesNo = {
      option: YesNo.YES,
    };

    it('should save permission for expert successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await savePermissionForExpert('validClaimId', permissionForExpert);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire: {experts: {permissionForExpert}}});
    });

    it('should update permission for expert successfully', async () => {
      const updatedPermissionForExpert: GenericYesNo = {
        option: YesNo.NO,
      };
      const updatedClaim = new Claim();
      updatedClaim.directionQuestionnaire = new DirectionQuestionnaire();
      updatedClaim.directionQuestionnaire.experts = new Experts();
      updatedClaim.directionQuestionnaire.experts.permissionForExpert = updatedPermissionForExpert;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.experts = new Experts();
        claim.directionQuestionnaire.experts.permissionForExpert = permissionForExpert;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await savePermissionForExpert('validClaimId', updatedPermissionForExpert);
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(savePermissionForExpert('claimId', {option: YesNo.NO}))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
