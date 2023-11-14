import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo, YesNoNotReceived} from 'form/models/yesNo';
import {summaryRow} from 'models/summaryList/summaryList';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {
  considerClaimantDocQuestion,
  considerClaimantDocResponse,
  getSentReportToOtherParties,
  getShareExpertWithClaimant,
  getUseExpertEvidence,
  requestExtra4WeeksQuestion,
  triedToSettleQuestion,
} from 'services/features/common/buildFastTrackHearingRequirements';
import {getSummaryRowForDisplayEvidenceYourself} from 'services/features/common/buildCommonHearingRequirements';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const getClaimWithDirectionQuestionnaire = (): Claim => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  return claim;
};
export const getClaimWithDirectionQuestionnaireAndHearing = (): Claim => {
  const claim = getClaimWithDirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();
  return claim;
};
const getClaimWithDirectionQuestionnaireAndExperts = (): Claim => {
  const claim = getClaimWithDirectionQuestionnaire();
  claim.directionQuestionnaire.experts = new Experts();
  return claim;
};

describe('Fast Track Claim Hearing Requirements Section', () => {
  const claimId = 'validClaimId';
  const lng = 'cimode';
  const changeButton = 'COMMON.BUTTONS.CHANGE';

  describe('Hearing requirements', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = getClaimWithDirectionQuestionnaireAndHearing();
    });
    describe('triedToSettleQuestion', () => {
      it('should return summaryRow with Yes when triedToSettle option is YES', () => {
        //Given
        claim.directionQuestionnaire.hearing.triedToSettle = {
          option: YesNo.YES,
        };
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE',
          'COMMON.VARIATION_2.YES',
          `/case/${claimId}/directions-questionnaire/tried-to-settle`,
          changeButton,
        );
        //Then
        expect(triedToSettleQuestion(claim, claimId, lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
      });
      it('should return No when direction questionnaire hearing is undefined', () => {
        //Given
        const claimWithNoHearing = new Claim();
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE',
          'COMMON.VARIATION_2.NO',
          `/case/${claimId}/directions-questionnaire/tried-to-settle`,
          changeButton,
        );
        //When
        const row = triedToSettleQuestion(claimWithNoHearing, claimId, lng, claim.directionQuestionnaire);
        //Then
        expect(row).toStrictEqual(mockSummarySection);
      });
      it('should return No when hearing is undefined', () => {
        //Given
        claim.directionQuestionnaire.hearing = undefined;
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE',
          'COMMON.VARIATION_2.NO',
          `/case/${claimId}/directions-questionnaire/tried-to-settle`,
          changeButton,
        );
        //When
        const row = triedToSettleQuestion(claim, claimId, lng, claim.directionQuestionnaire);
        //Then
        expect(row).toStrictEqual(mockSummarySection);
      });
    });
    describe('requestExtra4WeeksQuestion', () => {

      it('should return summaryRow if requestExtra4Weeks option is yes', () => {
        //Given
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
        expect(requestExtra4WeeksQuestion(claim, claimId, lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
      });
      it('should return No when direction questioner and hearing are undefined', () => {
        //Given
        const claimWithNoHearing = new Claim();
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS',
          'COMMON.NO',
          `/case/${claimId}/directions-questionnaire/request-extra-4-weeks`,
          changeButton,
        );
        //When
        const row =
          requestExtra4WeeksQuestion(claimWithNoHearing, claimId, lng, claim.directionQuestionnaire);
        //Then
        expect(row).toStrictEqual(mockSummarySection);
      });
    });

    describe('considerClaimantDocQuestion', () => {
      it('should return summaryRow if considerClaimantDocuments option is no', () => {
        //Given
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
        expect(considerClaimantDocQuestion(claim, claimId, lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
      });
      it('should return no for considerClaimantDocuments when direction questonnaire and hearin are undefined', () => {
        //Given
        const claimWithNoHearing = new Claim();
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT',
          'COMMON.NO',
          `/case/${claimId}/directions-questionnaire/consider-claimant-documents`,
          changeButton,
        );
        //Then
        expect(considerClaimantDocQuestion(claimWithNoHearing, claimId, lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
      });
      it('should return summaryRow for document details if considerClaimantDocuments option is Yes', () => {
        //Given
        claim.directionQuestionnaire.hearing.considerClaimantDocuments = {
          option: YesNo.YES,
          details: 'Test doc',
        };
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS',
          'Test doc',
        );
        //Then
        expect(considerClaimantDocResponse(claim, claimId, lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
      });
      it('should return empty string when details are not provided', () => {
        //Given
        claim.directionQuestionnaire.hearing.considerClaimantDocuments = {
          option: YesNo.YES,
        };
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS',
          '',
        );
        //Then
        expect(considerClaimantDocResponse(claim, claimId, lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
      });
      it('should return empty string when no hearing', () => {
        //Given
        const claimWithNoHearing = new Claim();
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS',
          '',
        );
        //Then
        expect(considerClaimantDocResponse(claimWithNoHearing, claimId, lng, claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
      });

    });

  });

  describe('should return expert summary row', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = getClaimWithDirectionQuestionnaireAndExperts();
    });
    it('should display the use of expert evidence No if the claimant choose not', () => {
      //Given
      claim.directionQuestionnaire.experts.expertEvidence = {option: YesNo.NO};
      const mockSummarySection = summaryRow(
        'PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE',
        'COMMON.NO',
        '/case/validClaimId/directions-questionnaire/expert-evidence',
        changeButton,
      );
      //When
      const doWantUseExpectEvidence = getUseExpertEvidence(claim, claimId, lng, claim.directionQuestionnaire);
      //Then
      expect(doWantUseExpectEvidence).toStrictEqual(mockSummarySection);
    });
    it('should display empty value when there is no hearing', () => {
      //Given
      claim = new Claim();
      const mockSummarySection = summaryRow(
        'PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE',
        '',
        '/case/validClaimId/directions-questionnaire/give-evidence-yourself',
        changeButton,
      );
      //When
      const personalEvidence = getSummaryRowForDisplayEvidenceYourself( claim.directionQuestionnaire, claimId, lng);
      //Then
      expect(personalEvidence).toStrictEqual(mockSummarySection);
    });
    it('should display No if the defendant does not accept to share expert  with the claimant', function () {
      //Given
      claim.directionQuestionnaire.experts.sharedExpert = {option: YesNo.NO};
      const mockSummarySection = summaryRow(
        'PAGES.SHARED_EXPERT.WITH_CLAIMANT',
        'COMMON.VARIATION_2.NO',
        '/case/validClaimId/directions-questionnaire/shared-expert',
        changeButton,
      );
      //When
      const shareExpertWithClaimant = getShareExpertWithClaimant(claim, claimId, lng, claim.directionQuestionnaire);
      //Then
      expect(shareExpertWithClaimant).toStrictEqual(mockSummarySection);
    });
    it('should display empty string when empty claim ', function () {
      //Given
      claim = new Claim();
      const mockSummarySection = summaryRow(
        'PAGES.SHARED_EXPERT.WITH_CLAIMANT',
        '',
        '/case/validClaimId/directions-questionnaire/shared-expert',
        changeButton,
      );
      //When
      const shareExpertWithClaimant = getShareExpertWithClaimant(claim, claimId, lng, claim.directionQuestionnaire);
      //Then
      expect(shareExpertWithClaimant).toStrictEqual(mockSummarySection);
    });
    it('should display No if the defendant has not send expert report to other parties', function () {
      //Given
      claim.directionQuestionnaire.experts.sentExpertReports = {option: YesNoNotReceived.NO};
      const mockSummarySection = summaryRow(
        'PAGES.SENT_EXPERT_REPORTS.TITLE',
        'COMMON.NO',
        '/case/validClaimId/directions-questionnaire/sent-expert-reports',
        changeButton,
      );
      //When
      const sentReportToOtherParties = getSentReportToOtherParties(claim, claimId, lng, claim.directionQuestionnaire);
      //Then
      expect(sentReportToOtherParties).toStrictEqual(mockSummarySection);
    });
    it('should display empty string when there is no expert reports data', function () {
      //Given
      claim = new Claim();
      const mockSummarySection = summaryRow(
        'PAGES.SENT_EXPERT_REPORTS.TITLE',
        '',
        '/case/validClaimId/directions-questionnaire/sent-expert-reports',
        changeButton,
      );
      //When
      const sentReportToOtherParties = getSentReportToOtherParties(claim, claimId, lng, claim.directionQuestionnaire);
      //Then
      expect(sentReportToOtherParties).toStrictEqual(mockSummarySection);
    });
    it('should display No if the claimant has not yet received expert report to other parties', function () {
      //Given
      claim.directionQuestionnaire.experts.sentExpertReports = {option: YesNoNotReceived.NOT_RECEIVED};
      const mockSummarySection = summaryRow(
        'PAGES.SENT_EXPERT_REPORTS.TITLE',
        'PAGES.SENT_EXPERT_REPORTS.OPTION_NOT_RECEIVED',
        '/case/validClaimId/directions-questionnaire/sent-expert-reports',
        changeButton,
      );
      //When
      const sentReportToOtherParties = getSentReportToOtherParties(claim, claimId, lng, claim.directionQuestionnaire);
      //Then
      expect(sentReportToOtherParties).toStrictEqual(mockSummarySection);
    });
  });
});
