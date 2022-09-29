import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {
  getphoneOrVideoHearing, savephoneOrVideoHearing,
} from '../../../../../main/services/features/directionsQuestionnaire/phoneOrVideoHearingService';
import {
  PhoneOrVideoHearing,
} from '../../../../../main/common/models/directionsQuestionnaire/hearing/phoneOrVideoHearing';
import {Hearing} from '../../../../../main/common/models/directionsQuestionnaire/hearing/hearing';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Phone or Video Hearing Service', () => {
  describe('getphoneOrVideoHearing', () => {
    it('should return consider phone or video hearing object with undefined options', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const phoneOrVideoHearing = await getphoneOrVideoHearing('validClaimId');

      expect(phoneOrVideoHearing.option).toBeUndefined();
      expect(phoneOrVideoHearing.details).toBeUndefined();
    });

    it('should return consider phone or video option with Yes option and details', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.YES, details: 'details'};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const phoneOrVideoHearing = await getphoneOrVideoHearing('validClaimId');

      expect(phoneOrVideoHearing.option).toBe(YesNo.YES);
      expect(phoneOrVideoHearing.details).toContain('details');
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getphoneOrVideoHearing('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('savePhoneOrVideoHearing', () => {
    const phoneOrVideoHearing: PhoneOrVideoHearing = {
      option: YesNo.YES,
      details: 'details',
    };

    it('should save phone or video hearing successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await savephoneOrVideoHearing('validClaimId', phoneOrVideoHearing);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire: {hearing: {phoneOrVideoHearing}} });
    });

    it('should update phone or video hearing successfully', async () => {
      const updatedPhoneOrVideoHearing: PhoneOrVideoHearing = {
        option: YesNo.NO,
        details: 'updated',
      };
      const updatedClaim = new Claim();
      updatedClaim.directionQuestionnaire = new DirectionQuestionnaire();
      updatedClaim.directionQuestionnaire.hearing = new Hearing();
      updatedClaim.directionQuestionnaire.hearing.phoneOrVideoHearing = updatedPhoneOrVideoHearing;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.hearing = new Hearing();
        claim.directionQuestionnaire.hearing.phoneOrVideoHearing = phoneOrVideoHearing;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await savephoneOrVideoHearing('validClaimId', updatedPhoneOrVideoHearing);
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(savephoneOrVideoHearing('claimId', {option: YesNo.NO}))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
