import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import * as responseDraftStoreService from '../../../../../main/modules/draft-store/response/responseDraftStoreService';
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
import {CaseState} from 'common/form/models/claimDetails';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store/response/responseDraftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;
const mockGetResponseDraft = responseDraftStoreService.getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = responseDraftStoreService.updateResponseDraft as jest.Mock;

const caseId = 'validClaimId';
const redisKey = 'validClaimIduserId';
const mockReq = {
  params: {id: caseId},
  session: {user: {id: 'userId'}},
} as unknown as AppRequest;

const draftForClaim = (claim: Claim) => ({
  claimResponse: {case_data: claim},
  rawResponse: {draftId: 'draft-1'},
  createdAt: new Date().toISOString(),
});

describe('Direction questionnaire Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    mockGetResponseClaimById.mockResolvedValue(new Claim());
    mockGetResponseDraft.mockResolvedValue(draftForClaim(new Claim()));
    mockUpdateResponseDraft.mockResolvedValue(undefined);
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('getDirectionQuestionnaire', () => {
    it('should return undefined if defendant direction questionnaire is not set', async () => {
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire?.experts?.expertEvidence).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.triedToSettle).toBeUndefined();
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return defendant Direction questionnaire object', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(claim);

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire?.experts?.expertEvidence).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.triedToSettle).toBeUndefined();
    });

    it('should return claimant Direction questionnaire object', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire?.experts?.expertReportDetails).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.determinationWithoutHearing).toBeUndefined();
      expect(mockGetResponseClaimById).not.toHaveBeenCalled();
    });

    it('should return defendant Direction questionnaire object with expertEvidence no', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(claim);

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire?.experts?.expertEvidence?.option).toBe(YesNo.NO);
      expect(directionQuestionnaire?.hearing?.triedToSettle).toBeUndefined();
    });

    it('should return claimant Direction questionnaire object with determinationWithoutHearing no', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.NO,
        reasonForHearing: 'test',
      };
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire?.hearing?.determinationWithoutHearing?.option).toBe(YesNo.NO);
      expect(directionQuestionnaire?.experts?.expertReportDetails).toBeUndefined();
    });

    it('should return claimant Direction questionnaire object with expert report details', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.experts = new Experts();
      claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = {
        option: YesNo.YES,
      };
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire?.hearing?.determinationWithoutHearing).toBeUndefined();
      expect(directionQuestionnaire?.experts?.expertReportDetails?.option).toBe(YesNo.YES);
    });

    it('should return defendant Direction questionnaire object with triedToSettle no', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.triedToSettle = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(claim);

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire.hearing?.triedToSettle?.option).toBe(YesNo.NO);
      expect(directionQuestionnaire.experts?.expertEvidence).toBeUndefined();
    });

    it('should return defendant Direction questionnaire object with expertEvidence yes and triedToSettle no', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.experts.expertEvidence = {
        option: YesNo.YES,
      };
      claim.directionQuestionnaire.hearing.triedToSettle = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(claim);

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire?.experts?.expertEvidence?.option).toBe(YesNo.YES);
      expect(directionQuestionnaire?.hearing?.triedToSettle?.option).toBe(YesNo.NO);
    });

    it('should return defendant`s phone or video hearing object with undefined options', async () => {
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option).toBeUndefined();
      expect(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details).toBeUndefined();
    });

    it('should return defendant`s consider phone or video option with Yes option and details', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.YES, details: 'details'};
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(claim);

      const directionQuestionnaire = await getDirectionQuestionnaire(mockReq);

      expect(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option).toBe(YesNo.YES);
      expect(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details).toContain('details');
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getDirectionQuestionnaire(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('getGenericOption', () => {
    it('should return generic option object with undefined option', async () => {
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const expertEvidence = await getGenericOption(mockReq, 'Test');
      expect(expertEvidence.option).toBeUndefined();
    });

    it('should return request expertEvidence option with Yes option', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertEvidence = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(claim);

      const expertEvidence = await getGenericOption(mockReq, 'expertEvidence', 'experts');

      expect(expertEvidence.option).toBe(YesNo.YES);
    });

    it('should return request expertEvidence option with Yes option - claimant journey', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.experts = new Experts();
      claim.claimantResponse.directionQuestionnaire.experts.expertEvidence = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const expertEvidence = await getGenericOption(mockReq, 'expertEvidence', 'experts');

      expect(expertEvidence.option).toBe(YesNo.YES);
      expect(mockGetResponseClaimById).not.toHaveBeenCalled();
    });

    it('should return claimant permissionForExpert option with Yes option', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.experts = new Experts();
      claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const permissionForExpert = await getGenericOption(mockReq, 'permissionForExpert', 'experts');

      expect(permissionForExpert.option).toBe(YesNo.YES);
    });

    it('should return claimant directionQuestionnaire if existing', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const permissionForExpert = await getGenericOption(mockReq, 'permissionForExpert', 'experts');

      expect(permissionForExpert.option).toBeUndefined();
    });

    it('should return new claimant directionQuestionnaire if not existing', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const permissionForExpert = await getGenericOption(mockReq, 'permissionForExpert', 'experts');

      expect(permissionForExpert.option).toBeUndefined();
    });

    it('should return claimant permissionForExpert option with No option', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.experts = new Experts();
      claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.NO};
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const permissionForExpert = await getGenericOption(mockReq, 'permissionForExpert', 'experts');

      expect(permissionForExpert.option).toBe(YesNo.NO);
    });

    it('should return claimant defendantYourselfEvidence option with Yes option', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const defendantYourselfEvidence = await getGenericOption(mockReq, 'defendantYourselfEvidence');

      expect(defendantYourselfEvidence.option).toBe(YesNo.YES);
    });

    it('should return claimant defendantYourselfEvidence option with No option', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.NO};
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const defendantYourselfEvidence = await getGenericOption(mockReq, 'defendantYourselfEvidence');

      expect(defendantYourselfEvidence.option).toBe(YesNo.NO);
    });

    it('should return generic option object with undefined option - claimant journey - no directionQuestionnaire', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const expertEvidence = await getGenericOption(mockReq, 'Test');

      expect(expertEvidence.option).toBeUndefined();
    });

    it('should return generic option object with undefined option - claimant journey - no claimantResponse', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);

      const expertEvidence = await getGenericOption(mockReq, 'Test');

      expect(expertEvidence.option).toBeUndefined();
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await expect(getGenericOption(mockReq, 'Test')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveDirectionQuestionnaire', () => {
    const directionQuestionnaire = new DirectionQuestionnaire();
    directionQuestionnaire.experts = new Experts();
    directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.YES);

    it('should save defendant direction questionnaire successfully', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.hearing = new Hearing();
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseDraft.mockResolvedValue(draftForClaim(claim));
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.hearing = new Hearing();
      directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.NO);

      await saveDirectionQuestionnaire(mockReq, directionQuestionnaire?.experts?.expertEvidence, 'expertEvidence', 'experts');

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(mockReq, caseId, expect.any(Claim), 'draft-1');
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save claimant direction questionnaire successfully', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      const dq = new DirectionQuestionnaire();
      dq.experts = new Experts();
      dq.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire = dq;
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.hearing = new Hearing();
      directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.NO);

      await saveDirectionQuestionnaire(mockReq, directionQuestionnaire?.hearing?.triedToSettle, 'triedToSettle', 'hearing');

      expect(mockSaveDraftClaim).toHaveBeenCalledWith(redisKey, claim);
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should update defendant direction questionnaire successfully', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.hearing = new Hearing();
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseDraft.mockResolvedValue(draftForClaim(claim));
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.hearing = new Hearing();
      directionQuestionnaire.experts.expertEvidence = undefined;
      directionQuestionnaire.hearing.triedToSettle = new GenericYesNo(YesNo.NO);

      await saveDirectionQuestionnaire(mockReq, directionQuestionnaire?.hearing?.triedToSettle, 'triedToSettle', 'hearing');

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(mockReq, caseId, expect.any(Claim), 'draft-1');
    });

    it('should update claimant direction questionnaire successfully', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      const dq = new DirectionQuestionnaire();
      dq.experts = new Experts();
      dq.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire = dq;
      mockGetCaseDataFromDraftStore.mockResolvedValue(claim);
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.hearing = new Hearing();
      directionQuestionnaire.experts.expertEvidence = undefined;
      directionQuestionnaire.hearing.triedToSettle = new GenericYesNo(YesNo.NO);

      await saveDirectionQuestionnaire(mockReq, directionQuestionnaire?.hearing?.triedToSettle, 'triedToSettle', 'hearing');

      expect(mockSaveDraftClaim).toHaveBeenCalledWith(redisKey, claim);
    });

    it('should update defendant`s phone or video hearing successfully', async () => {
      const phoneOrVideoHearing: PhoneOrVideoHearing = {
        option: YesNo.YES,
        details: 'details',
      };
      const updatedPhoneOrVideoHearing: PhoneOrVideoHearing = {
        option: YesNo.NO,
        details: 'updated',
      };
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.phoneOrVideoHearing = phoneOrVideoHearing;
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseDraft.mockResolvedValue(draftForClaim(claim));

      await saveDirectionQuestionnaire(mockReq, updatedPhoneOrVideoHearing, 'phoneOrVideoHearing', 'hearing');

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          directionQuestionnaire: expect.objectContaining({
            hearing: expect.objectContaining({
              phoneOrVideoHearing: updatedPhoneOrVideoHearing,
            }),
          }),
        }),
        'draft-1',
      );
    });

    it('should save defendant`s expert details successfully', async () => {
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
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();
      claim.directionQuestionnaire.experts.expertDetailsList = expertDetailsList;
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseDraft.mockResolvedValue(draftForClaim(claim));

      await saveDirectionQuestionnaire(mockReq, updatedExpertDetailsList, 'expertDetailsList', 'experts');

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          directionQuestionnaire: expect.objectContaining({
            experts: expect.objectContaining({
              expertDetailsList: updatedExpertDetailsList,
            }),
          }),
        }),
        'draft-1',
      );
    });

    it('should save defendant`s other witness successfully', async () => {
      const otherWitnesses = {
        option: YesNo.YES,
        items: [new OtherWitnessItems({
          firstName: 'John',
          lastName: 'Doe',
          email: undefined,
          telephone: undefined,
          details: 'accident',
        })],
      };
      const updatedOtherWitnesses = {
        option: YesNo.YES,
        items: [new OtherWitnessItems({
          firstName: 'Mike',
          lastName: 'Brown',
          email: undefined,
          telephone: undefined,
          details: 'damage',
        })],
      };
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.witnesses = new Witnesses();
      claim.directionQuestionnaire.witnesses.otherWitnesses = otherWitnesses;
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseDraft.mockResolvedValue(draftForClaim(claim));

      await saveDirectionQuestionnaire(mockReq, updatedOtherWitnesses, 'otherWitnesses', 'witnesses');

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          directionQuestionnaire: expect.objectContaining({
            witnesses: expect.objectContaining({
              otherWitnesses: updatedOtherWitnesses,
            }),
          }),
        }),
        'draft-1',
      );
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveDirectionQuestionnaire(mockReq, new GenericYesNo(YesNo.YES), 'expertEvidence', 'experts'))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
