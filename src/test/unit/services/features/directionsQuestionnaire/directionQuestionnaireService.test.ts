import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../../src/test/utils/errorMessageTestConstants';
import {YesNo} from 'form/models/yesNo';
import {
  getDirectionQuestionnaire,
  getGenericOption,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Experts} from 'models/directionsQuestionnaire/experts/experts';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {PhoneOrVideoHearing} from 'models/directionsQuestionnaire/hearing/phoneOrVideoHearing';
import {ExpertDetails} from 'models/directionsQuestionnaire/experts/expertDetails';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {Witnesses} from 'models/directionsQuestionnaire/witnesses/witnesses';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {ReportDetail} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {CaseState} from 'common/form/models/claimDetails';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Direction questionnaire Service', () => {
  describe('getDirectionQuestionnaire', () => {
    it('should return undefined if defendant direction questionnaire is not set', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      //Then
      expect(directionQuestionnaire?.experts?.defendantExpertEvidence).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.triedToSettle).toBeUndefined();
    });
    it('should return defendant Direction questionnaire object', async () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      //When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      //Then
      expect(directionQuestionnaire?.experts?.defendantExpertEvidence).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.triedToSettle).toBeUndefined();
    });

    it('should return claimant Direction questionnaire object', async () => {
      // Given
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      // When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      // Then
      expect(directionQuestionnaire?.experts?.expertReportDetails).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.determinationWithoutHearing).toBeUndefined();
    });

    it('should return defendant Direction questionnaire object with defendantExpertEvidence no', async () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.defendantExpertEvidence = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      //When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      //Then
      expect(directionQuestionnaire?.experts?.defendantExpertEvidence?.option).toBe(YesNo.NO);
      expect(directionQuestionnaire?.hearing?.triedToSettle).toBeUndefined();
    });

    it('should return claimant Direction questionnaire object with determinationWithoutHearing no', async () => {
      //Given
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.NO,
        reasonForHearing: 'test',
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      //When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      //Then
      expect(directionQuestionnaire?.hearing?.determinationWithoutHearing?.option).toBe(YesNo.NO);
      expect(directionQuestionnaire?.experts?.expertReportDetails).toBeUndefined();
    });

    it('should return claimant Direction questionnaire object with expert report details', async () => {
      //Given
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.experts = new Experts();
      claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = {
        option: YesNo.YES,
        reportDetails: [
          new ReportDetail('John Doe'),
        ],
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      //When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      //Then
      expect(directionQuestionnaire?.hearing?.determinationWithoutHearing).toBeUndefined();
      expect(directionQuestionnaire?.experts?.expertReportDetails?.option).toBe(YesNo.YES);
      expect(directionQuestionnaire?.experts?.expertReportDetails?.reportDetails[0].expertName).toBe('John Doe');
    });

    it('should return defendant Direction questionnaire object with triedToSettle no', async () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.triedToSettle = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      //When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      //Then
      expect(directionQuestionnaire.hearing?.triedToSettle?.option).toBe(YesNo.NO);
      expect(directionQuestionnaire.experts?.defendantExpertEvidence).toBeUndefined();
    });

    it('should return defendant Direction questionnaire object with defendantExpertEvidence yes and triedToSettle no', async () => {
      //Given
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
      //When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      //Then
      expect(directionQuestionnaire?.experts?.defendantExpertEvidence?.option).toBe(YesNo.YES);
      expect(directionQuestionnaire?.hearing?.triedToSettle?.option).toBe(YesNo.NO);
    });

    it('should return defendant`s phone or video hearing object with undefined options', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      //Then
      expect(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details).toBeUndefined();
    });

    it('should return defendant`s consider phone or video option with Yes option and details', async () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.YES, details: 'details'};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      //When
      const directionQuestionnaire = await getDirectionQuestionnaire('validClaimId');
      //Then
      expect(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option).toBe(YesNo.YES);
      expect(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details).toContain('details');
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

    it('should save defendant direction questionnaire successfully', async () => {
      //Given
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
      //When
      await saveDirectionQuestionnaire('validClaimId', directionQuestionnaire?.experts?.defendantExpertEvidence, 'defendantExpertEvidence', 'experts');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire});
    });

    it('should save claimant direction questionnaire successfully', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        claim.claimantResponse = new ClaimantResponse();
        const directionQuestionnaire = new DirectionQuestionnaire();
        directionQuestionnaire.experts = new Experts();
        directionQuestionnaire.hearing = new Hearing();
        claim.claimantResponse.directionQuestionnaire = directionQuestionnaire;
        return claim;
      });
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.hearing = new Hearing();
      directionQuestionnaire.experts.defendantExpertEvidence = new GenericYesNo(YesNo.NO);
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveDirectionQuestionnaire('validClaimId', directionQuestionnaire?.hearing?.triedToSettle, 'triedToSettle', 'hearing');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire});
    });

    it('should update defendant direction questionnaire successfully', async () => {
      //Given
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
      //When
      await saveDirectionQuestionnaire('validClaimId', directionQuestionnaire?.hearing?.triedToSettle, 'triedToSettle', 'hearing');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire});
    });

    it('should update claimant direction questionnaire successfully', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        claim.claimantResponse = new ClaimantResponse();
        const directionQuestionnaire = new DirectionQuestionnaire();
        directionQuestionnaire.experts = new Experts();
        directionQuestionnaire.hearing = new Hearing();
        claim.claimantResponse.directionQuestionnaire = directionQuestionnaire;
        return claim;
      });
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.hearing = new Hearing();
      directionQuestionnaire.experts.defendantExpertEvidence = undefined;
      directionQuestionnaire.hearing.triedToSettle = new GenericYesNo(YesNo.NO);
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveDirectionQuestionnaire('validClaimId', directionQuestionnaire?.hearing?.triedToSettle, 'triedToSettle', 'hearing');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire});
    });

    it('should update defendant`s phone or video hearing successfully', async () => {
      //Given
      const phoneOrVideoHearing: PhoneOrVideoHearing = {
        option: YesNo.YES,
        details: 'details',
      };

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
      //When
      await saveDirectionQuestionnaire('validClaimId', updatedPhoneOrVideoHearing, 'phoneOrVideoHearing', 'hearing');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
    });

    it('should save defendant`s expert details successfully', async () => {
      //Given
      const expertDetailsList = {
        items: [new ExpertDetails(
          'John', 'Doe', undefined, undefined, 'insurance', 'reason',
        )],
      };

      const updatedExpertDetailsList = {
        items: [new ExpertDetails(
          'Jason', 'Brown', undefined, undefined, 'accidents', 'complain',
        )],
      };
      const updatedClaim = new Claim();
      updatedClaim.directionQuestionnaire = new DirectionQuestionnaire();
      updatedClaim.directionQuestionnaire.experts = new Experts();
      updatedClaim.directionQuestionnaire.experts.expertDetailsList = updatedExpertDetailsList;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.experts = new Experts();
        claim.directionQuestionnaire.experts.expertDetailsList = expertDetailsList;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveDirectionQuestionnaire('validClaimId', updatedExpertDetailsList, 'expertDetailsList', 'experts');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
    });

    it('should save defendant`s other witness successfully', async () => {
      //Given
      const otherWitnesses = {
        option: YesNo.YES,
        items: [new OtherWitnessItems({
          firstName: 'John',
          lastName: 'Doe',
          email: undefined,
          telephone: undefined,
          details: 'accident',
        }),
        ],
      };

      const updatedOtherWitnesses = {
        option: YesNo.YES,
        items: [new OtherWitnessItems({
          firstName: 'Mike',
          lastName: 'Brown',
          email: undefined,
          telephone: undefined,
          details: 'damage',
        }),
        ],
      };
      const updatedClaim = new Claim();
      updatedClaim.directionQuestionnaire = new DirectionQuestionnaire();
      updatedClaim.directionQuestionnaire.witnesses = new Witnesses();
      updatedClaim.directionQuestionnaire.witnesses.otherWitnesses = updatedOtherWitnesses;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.witnesses = new Witnesses();
        claim.directionQuestionnaire.witnesses.otherWitnesses = otherWitnesses;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveDirectionQuestionnaire('validClaimId', updatedOtherWitnesses, 'otherWitnesses', 'witnesses');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
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
