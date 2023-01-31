import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {YesNo, YesNoNotReceived} from 'common/form/models/yesNo';
import {
  buildClaimantHearingRequirementsSection,
  buildClaimantResponseSubmitSection,
  buildHowDefendantRespondSection,
  buildWhatToDoNextSection,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistBuilder';
import {CaseState} from 'common/form/models/claimDetails';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Witnesses} from 'common/models/directionsQuestionnaire/witnesses/witnesses';
import {VulnerabilityQuestions} from 'common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {WelshLanguageRequirements} from 'common/models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {mockExpertDetailsList} from '../directionsQuestionnaire/experts/expertDetailsService.test';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, DETERMINATION_WITHOUT_HEARING_URL, DQ_TRIED_TO_SETTLE_CLAIM_URL} from 'routes/urls';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Claimant Response Task List builder', () => {
  const claimId = '5129';
  const lang = 'en';
  const viewDefendantsReponseUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL);
  const giveUsDetailsClaimantHearingSmallClaimsUrl = constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL);
  const giveUsDetailsClaimantHearingFastTrackUrl = constructResponseUrlWithIdParams(claimId, DQ_TRIED_TO_SETTLE_CLAIM_URL);
  const checkAndSubmitUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHECK_ANSWERS_URL);
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;

  describe('How they responded section', () => {
    it('should display view defendant`s response task as incomplete', () => {
      //When
      const howDefendantRespond = buildHowDefendantRespondSection(new Claim(), claimId, lang);
      //Then
      expect(howDefendantRespond.tasks.length).toBe(1);
      expect(howDefendantRespond.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.VIEW_DEFENDANTS_RESPONSE');
      expect(howDefendantRespond.tasks[0].url).toEqual(viewDefendantsReponseUrl);
      expect(howDefendantRespond.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display view defendant`s response task as complete', () => {
      //Given
      claim.claimantResponse = {defendantResponseViewed: true};
      //When
      const howDefendantRespond = buildHowDefendantRespondSection(claim, claimId, lang);
      //Then
      expect(howDefendantRespond.tasks.length).toBe(1);
      expect(howDefendantRespond.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.VIEW_DEFENDANTS_RESPONSE');
      expect(howDefendantRespond.tasks[0].url).toEqual(viewDefendantsReponseUrl);
      expect(howDefendantRespond.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });
  });

  describe('Choose what to do next section', () => {
    it('should display Accept or reject the amount task as incomplete', () => {
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });
  });

  describe('Your hearing requirements section', () => {
    it('shouldn`t display hearingRequirement section when there is no value for settlement', () => {
      //Given
      claim.claimantResponse.hasPartAdmittedBeenAccepted = undefined;
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0]).toBeUndefined();
    });

    it('shouldn`t display hearingRequirement section when claimant rejected settlement for defendent`s partial admission amount', () => {
      //Given
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0]).toBeUndefined();
    });

    describe('xxxx', () => {
      it('should display give us details for hearing task as incomplete when claimant rejected settlement for defendent`s partial admission amount', () => {
        //Given
        claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.NO};
        claim.totalClaimAmount = 10000;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task task as incomplete with empty directions questionnaire', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when other witnesses is not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.witnesses = new Witnesses();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when phone or video hearing is not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when vulnerability not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when welsh language requirements not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as complete for small claims when all information provided - expert not required scneraio', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.witnesses.otherWitnesses = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.hearing.whyUnavailableForHearing = {reason: 'test'};
        claim.claimantResponse.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.hearing.specificCourtLocation = {option: 'no'};
        claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
        claim.claimantResponse.directionQuestionnaire.experts = new Experts();
        claim.claimantResponse.directionQuestionnaire.experts.expertRequired = false;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingSmallClaimsUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as complete when expert required and expert report details available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertRequired = true;
        claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert required and expert report details not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertRequired = true;
        claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = {option: YesNo.NO};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as complete when expert required, expert report details not available but not wanted to ask for court permission to use an expert ', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.NO};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert required, expert report details not available but wanted to ask for court permission to use an expert ', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as complete when expert required, expert report details not available, wanted to ask for court permission to use an expert but there is nothing expert can still examine', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = {option: YesNo.NO};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert required, expert report details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine ', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as complete when expert required, expert report details not available, wanted to ask for court permission to use an expert, there is something expert can still examine but expert details not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert required, expert report details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine ', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = undefined;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

    });

    describe('yyyyy', () => {
      // it('shouldn`t display hearingRequirement section when claimant rejected settlement for defendent`s partial admission amount', () => {
      //   //Given
      //   claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES};
      //   claim.totalClaimAmount = 26000;
      //   //When
      //   const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //   //Then
      //   expect(hearingRequirement.tasks[0]).toBeUndefined();
      // });

      it('should display give us details for hearing task as incomplete when claimant rejected settlement for defendent`s partial admission amount', () => {
        //Given
        claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.NO};
        claim.totalClaimAmount = 26000;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task task as incomplete with empty directions questionnaire', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when other witnesses is not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.witnesses = new Witnesses();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when phone or video hearing is not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when vulnerability not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when welsh language requirements not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as complete for fast track claims when all information provided - expert evidence not used sceneraio', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.hearing.triedToSettle = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.hearing.requestExtra4weeks = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.hearing.considerClaimantDocuments = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts = new Experts();
        claim.claimantResponse.directionQuestionnaire.experts.defendantExpertEvidence = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.witnesses.otherWitnesses = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.hearing.whyUnavailableForHearing = {reason: 'test'};
        claim.claimantResponse.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.NO};
        claim.claimantResponse.directionQuestionnaire.hearing.specificCourtLocation = {option: 'no'};
        claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks.length).toBe(1);
        expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
        expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingFastTrackUrl);
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert evidence used but expert reports not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.defendantExpertEvidence = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.sentExpertReports = {};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert evidence used and sharing expert with other party not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.sharedExpert = {};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert evidence used and expert details not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = undefined;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as complete when expert evidence used, sent expert reports, sharedExpert and expert details available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.sentExpertReports = {option: YesNoNotReceived.YES};
        claim.claimantResponse.directionQuestionnaire.experts.sharedExpert = {option: YesNo.YES};
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      // also check the urls

      it('should display give us details for hearing task as complete when expert required, expert report details not available, wanted to ask for court permission to use an expert but there is nothing expert can still examine', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = {option: YesNo.NO};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert required, expert report details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine ', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = {option: YesNo.YES};
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });

      it('should display give us details for hearing task as complete when expert required, expert report details not available, wanted to ask for court permission to use an expert, there is something expert can still examine but expert details not available', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
      });

      it('should display give us details for hearing task as incomplete when expert required, expert report details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine ', () => {
        //Given
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = undefined;
        //When
        const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
        //Then
        expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
      });
    });
  });

  describe('Submit section', () => {
    it('should display check and submit your response task as incomplete', () => {
      //When
      const submit = buildClaimantResponseSubmitSection(claimId, lang);
      //Then
      expect(submit.tasks[0].description).toEqual('TASK_LIST.SUBMIT.CHECK_AND_SUBMIT');
      expect(submit.tasks[0].url).toEqual(checkAndSubmitUrl);
      expect(submit.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });
  });
});
