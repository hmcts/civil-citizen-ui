import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo, YesNoNotReceived} from 'form/models/yesNo';
import {summaryRow} from 'models/summaryList/summaryList';
import {
  considerClaimantDocQuestion,
  considerClaimantDocResponse, getExpertDetails,
  getSentReportToOtherParties,
  getShareExpertWithClaimant,
  getUseExpertEvidence,
  requestExtra4WeeksQuestion,
  triedToSettleQuestion,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildFastTrackHearingRequirements';
import {Experts} from '../../../../../../../main/common/models/directionsQuestionnaire/experts/experts';
import {
  giveEvidenceYourself,
} from '../../../../../../../main/services/features/response/checkAnswers/hearingRequirementsSection/buildCommonHearingRequirements';
import {
  ExpertDetailsList,
} from '../../../../../../../main/common/models/directionsQuestionnaire/experts/expertDetailsList';
import {ExpertDetails} from '../../../../../../../main/common/models/directionsQuestionnaire/experts/expertDetails';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Fast Track Claim Hearing Requirements Section', () => {
  const claimId = 'validClaimId';
  const lng = 'cimode';
  const changeButton = 'COMMON.BUTTONS.CHANGE';

  describe('triedToSettleQuestion', () => {
    it('should return summaryRow if triedToSettle option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.triedToSettle = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE',
        'COMMON.NO',
        `/case/${claimId}/directions-questionnaire/tried-to-settle`,
        changeButton,
      );
      //Then
      expect(triedToSettleQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

  describe('requestExtra4WeeksQuestion', () => {

    it('should return summaryRow if requestExtra4Weeks option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.requestExtra4weeks = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS',
        'COMMON.YES',
        `/case/${claimId}/directions-questionnaire/request-extra-4-weeks`,
        changeButton,
      );
      //Then
      expect(requestExtra4WeeksQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

  describe('considerClaimantDocQuestion', () => {
    it('should return summaryRow if considerClaimantDocuments option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.considerClaimantDocuments = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT',
        'COMMON.NO',
        `/case/${claimId}/directions-questionnaire/consider-claimant-documents`,
        changeButton,
      );
      //Then
      expect(considerClaimantDocQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow for document details if considerClaimantDocuments option is Yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.considerClaimantDocuments = {
        option: YesNo.NO,
        details: 'Test doc',
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS',
        'Test doc',
      );
      //Then
      expect(considerClaimantDocResponse(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

  describe('should return summary row relative to expect', ()=>{
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.experts = new Experts();

    it('should not display expert if the the expect evidence is NO',  () => {
      //Given
      claim.directionQuestionnaire.experts.expertEvidence =  {option:YesNo.NO};
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList();
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList(
        [new ExpertDetails('Mike', 'James', 'mike@gmail.com', 7411111,
          'reason', 'expert', 500)]);

      const result: any[] = [];

      //When
      const expertDetails = getExpertDetails(claim, claimId, lng);

      //Then
      expect(expertDetails).toStrictEqual(result);
    });
    it('should display expert details if the expect evidence is YES', function () {

      //Given
      claim.directionQuestionnaire.experts.expertEvidence = {option:YesNo.YES};
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList();

      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList(
        [new ExpertDetails('Mike', 'James', 'mike@gmail.com', 7411111, 'reason', 'expert', 500)],
      );

      //When
      const summaryRows = getExpertDetails(claim, '1', 'eng');
      //Then
      expect(summaryRows.length).toEqual(8);
      expect(summaryRows[0].key.text).toEqual('PAGES.EXPERT_DETAILS.SECTION_TITLE 1');
      expect(summaryRows[1].key.text).toEqual('PAGES.EXPERT_DETAILS.FIRST_NAME_OPTIONAL');
      expect(summaryRows[1].value.html).toEqual('Mike');
      expect(summaryRows[2].key.text).toEqual('PAGES.EXPERT_DETAILS.LAST_NAME_OPTIONAL');
      expect(summaryRows[2].value.html).toEqual('James');
      expect(summaryRows[3].key.text).toEqual('PAGES.EXPERT_DETAILS.EMAIL_ADDRESS_OPTIONAL');
      expect(summaryRows[3].value.html).toEqual('mike@gmail.com');
      expect(summaryRows[4].key.text).toEqual('PAGES.EXPERT_DETAILS.PHONE_OPTIONAL');
      expect(summaryRows[4].value.html).toEqual('7411111');
      expect(summaryRows[5].key.text).toEqual('PAGES.EXPERT_DETAILS.FIELD_OF_EXPERTISE');
      expect(summaryRows[5].value.html).toEqual('expert');
      expect(summaryRows[6].key.text).toEqual('PAGES.EXPERT_DETAILS.TELL_US_WHY_NEED_EXPERT');
      expect(summaryRows[6].value.html).toEqual('reason');
      expect(summaryRows[7].key.text).toEqual('PAGES.EXPERT_DETAILS.COST_OPTIONAL');
      expect(summaryRows[7].value.html).toEqual('500');

    });
    it('should display the use of expert evidence No if the claimant choose not',  () => {

      //Given
      claim.directionQuestionnaire.experts.expertEvidence = {option: YesNo.NO};
      const mockSummarySection = summaryRow(
        'PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE',
        'COMMON.NO',
        '/case/validClaimId/directions-questionnaire/expert-evidence',
        changeButton,
      );
      //When
      const doWantUseExpectEvidence = getUseExpertEvidence(claim, claimId, lng);
      //Then
      expect(doWantUseExpectEvidence).toStrictEqual(mockSummarySection);
    });
    it('should display the use of own evidence No if the claimant choose not',  () => {

      claim.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.NO};
      //Given
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE',
        'COMMON.NO',
        '/case/validClaimId/directions-questionnaire/give-evidence-yourself',
        changeButton,
      );
      //When
      const personalEvidence = giveEvidenceYourself(claim, claimId, lng);
      //Then
      expect(personalEvidence).toStrictEqual(mockSummarySection);
    });
    it('should display No if the defendant does not accept to share expert  with the claimant', function () {

      //Given
      claim.directionQuestionnaire.experts.sharedExpert = {option: YesNo.NO};
      const mockSummarySection = summaryRow(
        'PAGES.SHARED_EXPERT.WITH_CLAIMANT',
        'COMMON.NO',
        '/case/validClaimId/directions-questionnaire/shared-expert',
        changeButton,
      );
      //When
      const shareExpertWithClaimant = getShareExpertWithClaimant(claim, claimId, lng);
      //Then
      expect(shareExpertWithClaimant).toStrictEqual(mockSummarySection);
    });
    it('should display No if the defendant has not send expert report to other parties', function () {
      //Given
      claim.directionQuestionnaire.experts.sentExpertReports = { option: YesNoNotReceived.NO };
      const mockSummarySection = summaryRow(
        'PAGES.SENT_EXPERT_REPORTS.TITLE',
        'COMMON.NO',
        '/case/validClaimId/directions-questionnaire/sent-expert-reports',
        changeButton,
      );
      //When
      const sentReportToOtherParties = getSentReportToOtherParties(claim, claimId, lng);
      //Then
      expect(sentReportToOtherParties).toStrictEqual(mockSummarySection);
    });
    it('should display No if the claimant has not yet received expert report to other parties', function () {

      //Given
      claim.directionQuestionnaire.experts.sentExpertReports = { option: YesNoNotReceived.NOT_RECEIVED };
      const mockSummarySection = summaryRow(
        'PAGES.SENT_EXPERT_REPORTS.TITLE',
        'PAGES.SENT_EXPERT_REPORTS.OPTION_NOT_RECEIVED',
        '/case/validClaimId/directions-questionnaire/sent-expert-reports',
        changeButton,
      );
      //When
      const sentReportToOtherParties = getSentReportToOtherParties(claim, claimId, lng);
      //Then
      expect(sentReportToOtherParties).toStrictEqual(mockSummarySection);
    });
  });

});
