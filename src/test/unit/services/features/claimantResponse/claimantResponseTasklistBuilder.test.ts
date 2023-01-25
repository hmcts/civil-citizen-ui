import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {YesNo} from 'common/form/models/yesNo';
import {
  buildClaimantHearingRequirementsSection,
  buildHowDefendantRespondSection,
  buildWhatToDoNextSection,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistBuilder';
import {CaseState} from 'common/form/models/claimDetails';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Witnesses} from 'common/models/directionsQuestionnaire/witnesses/witnesses';
// import {OtherWitnessItems} from 'common/models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {VulnerabilityQuestions} from 'common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {WelshLanguageRequirements} from 'common/models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {mockExpertDetailsList} from '../directionsQuestionnaire/experts/expertDetailsService.test';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, DETERMINATION_WITHOUT_HEARING_URL} from 'routes/urls';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Claimant Response Task List service', () => {
  const claimId = '5129';
  const lang = 'en';

  const viewDefendantsReponseUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL);
  const giveUsDetailsClaimantHearingUrl = constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL);

  describe('Cliamant response task list', () => {
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;

    it('should display how they responded task as incomplete', () => {
      //When
      const howDefendantRespond = buildHowDefendantRespondSection(new Claim(), claimId, lang);
      //Then
      expect(howDefendantRespond.tasks.length).toBe(1);
      expect(howDefendantRespond.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.VIEW_DEFENDANTS_RESPONSE');
      expect(howDefendantRespond.tasks[0].url).toEqual(viewDefendantsReponseUrl);
      expect(howDefendantRespond.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display how they responded task as complete', () => {
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

    it('should display whatToDoNext task as incomplete', () => {
      //When
      const whatToDoNext = buildWhatToDoNextSection(claim, claimId, lang);
      //Then
      expect(whatToDoNext.tasks[0].description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED');
      expect(whatToDoNext.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('shouldn`t display hearingRequirement task when there is no value for settlement', () => {
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0]).toBeUndefined();
    });

    it('shouldn`t display hearingRequirement task when claimant rejected settlement for defendent`s partial admission amount', () => {
      //Given
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0]).toBeUndefined();
    });

    it('should display hearingRequirement task as incomplete when claimant rejected settlement for defendent`s partial admission amount', () => {
      //Given
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.NO};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks.length).toBe(1);
      expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingUrl);
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display hearingRequirement task as complete for small claims when all information provided - expert not required scneraio', () => {
      //Given
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
      claim.claimantResponse.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};
      claim.claimantResponse.directionQuestionnaire.witnesses = new Witnesses();
      claim.claimantResponse.directionQuestionnaire.witnesses.otherWitnesses = {option: YesNo.NO};
      claim.claimantResponse.directionQuestionnaire.hearing.whyUnavailableForHearing = {reason: 'test'};
      claim.claimantResponse.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.NO};
      claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
      claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
      claim.claimantResponse.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.NO};
      claim.claimantResponse.directionQuestionnaire.hearing.specificCourtLocation = {option: 'no'};
      claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
      claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
      claim.claimantResponse.directionQuestionnaire.experts = new Experts();
      claim.claimantResponse.directionQuestionnaire.experts.expertNotRequired = true;
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks.length).toBe(1);
      expect(hearingRequirement.tasks[0].description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
      expect(hearingRequirement.tasks[0].url).toEqual(giveUsDetailsClaimantHearingUrl);
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });

    it('should display hearingRequirement task as complete for small claims when expert required and expert report details available', () => {
      //Given
      claim.claimantResponse.directionQuestionnaire.experts = new Experts();
      claim.claimantResponse.directionQuestionnaire.experts.expertNotRequired = false;
      claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = {option: YesNo.YES};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });


    it('should display hearingRequirement task as incomplete for small claims when expert required and expert report details not available', () => {
      //Given
      claim.claimantResponse.directionQuestionnaire.experts = new Experts();
      claim.claimantResponse.directionQuestionnaire.experts.expertNotRequired = false;
      claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = {option: YesNo.NO};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display hearingRequirement task as complete for small claims when expert required, expert report details not available but not wanted to ask for court permission to use an expert ', () => {
      //Given
      claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.NO};      //When
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });

    it('should display hearingRequirement task as incomplete for small claims when expert required, expert report details not available but wanted to ask for court permission to use an expert ', () => {
      //Given
      claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.YES};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display hearingRequirement task as complete for small claims when expert required, expert report details not available, wanted to ask for court permission to use an expert but there is nothing expert can still examine', () => {
      //Given
      claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = {option: YesNo.NO};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });

    it('should display hearingRequirement task as incomplete for small claims when expert required, expert report details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine ', () => {
      //Given
      claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = {option: YesNo.YES};
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should display hearingRequirement task as complete for small claims when expert required, expert report details not available, wanted to ask for court permission to use an expert, there is something expert can still examine but expert details not available', () => {
      //Given
      claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.COMPLETE);
    });

    it('should display hearingRequirement task as incomplete for small claims when expert required, expert report details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine ', () => {
      //Given
      claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = undefined;
      //When
      const hearingRequirement = buildClaimantHearingRequirementsSection(claim, claimId, lang);
      //Then
      expect(hearingRequirement.tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });
  });
});
