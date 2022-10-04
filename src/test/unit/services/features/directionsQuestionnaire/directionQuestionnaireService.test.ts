import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {
  getDirectionQuestionnaire,
  getGenericOption,
  saveDirectionQuestionnaire,
} from '../../../../../main/services/features/directionsQuestionnaire/directionQuestionnaireService';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';
import {Experts} from '../../../../../main/common/models/directionsQuestionnaire/experts/experts';
import {Hearing} from '../../../../../main/common/models/directionsQuestionnaire/hearing/hearing';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Direction questionnaire Service', () => {
  describe('getDirectionQuestionnaire', () => {
    it('should return undefined if direction questionnaire is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      expect(directionQuestionnaire?.experts?.defendantExpertEvidence).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.triedToSettle).toBeUndefined();
    });
    it('should return Direction questionnaire object', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');

      expect(directionQuestionnaire?.experts?.defendantExpertEvidence).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.triedToSettle).toBeUndefined();
    });

    it('should return Direction questionnaire object with defendantExpertEvidence no', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.defendantExpertEvidence = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');

      expect(directionQuestionnaire?.experts?.defendantExpertEvidence?.option).toBe(YesNo.NO);
      expect(directionQuestionnaire?.hearing?.triedToSettle).toBeUndefined();
    });
    it('should return Direction questionnaire object with triedToSettle no', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.triedToSettle = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');

      expect(directionQuestionnaire.hearing?.triedToSettle?.option).toBe(YesNo.NO);
      expect(directionQuestionnaire.experts?.defendantExpertEvidence).toBeUndefined();
    });

    it('should return Direction questionnaire object with defendantExpertEvidence yes and triedToSettle no', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.experts.defendantExpertEvidence = {
        option: YesNo.YES,
      };
      claim.directionQuestionnaire.hearing.triedToSettle = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');

      expect(directionQuestionnaire?.experts?.defendantExpertEvidence?.option).toBe(YesNo.YES);
      expect(directionQuestionnaire?.hearing?.triedToSettle?.option).toBe(YesNo.NO);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getDirectionQuestionnaire('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('getGenericOption', () => {
    it('should return generic option object with undefined option', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const expertEvidence = await getGenericOption('validClaimId', 'Test');
      expect(expertEvidence.option).toBeUndefined();
    });

    it('should return request defendantExpertEvidence option with Yes option', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.defendantExpertEvidence = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const expertEvidence = await getGenericOption('validClaimId', 'defendantExpertEvidence', 'experts');
      expect(expertEvidence.option).toBe(YesNo.YES);
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await expect(getGenericOption('claimId', 'Test')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveDirectionQuestionnaire', () => {
    const directionQuestionnaire = new DirectionQuestionnaire();
    directionQuestionnaire.experts = new Experts();
    directionQuestionnaire.experts.defendantExpertEvidence = new GenericYesNo(YesNo.YES);

    it('should save direction questionnaire successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.experts = new Experts();
        claim.directionQuestionnaire.hearing = new Hearing();
        return claim;
      });
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.hearing = new Hearing();
      directionQuestionnaire.experts.defendantExpertEvidence = new GenericYesNo(YesNo.NO);
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveDirectionQuestionnaire('validClaimId', directionQuestionnaire?.experts?.defendantExpertEvidence, 'defendantExpertEvidence', 'experts');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire});
    });

    it('should update claim determination successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.experts = new Experts();
        claim.directionQuestionnaire.hearing = new Hearing();
        return claim;
      });
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.hearing = new Hearing();
      directionQuestionnaire.experts.defendantExpertEvidence = undefined;
      directionQuestionnaire.hearing.triedToSettle = new GenericYesNo(YesNo.NO);
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveDirectionQuestionnaire('validClaimId', directionQuestionnaire?.hearing?.triedToSettle, 'triedToSettle', 'hearing');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire});
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveDirectionQuestionnaire('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
