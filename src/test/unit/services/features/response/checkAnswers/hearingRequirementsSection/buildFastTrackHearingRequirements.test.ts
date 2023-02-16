import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo} from 'form/models/yesNo';
import {summaryRow} from 'models/summaryList/summaryList';
import {
  considerClaimantDocQuestion, considerClaimantDocResponse,
  requestExtra4WeeksQuestion,
  triedToSettleQuestion,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildFastTrackHearingRequirements';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
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
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.triedToSettle = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE',
        'No',
        `/case/${claimId}/directions-questionnaire/tried-to-settle`,
        changeButton,
      );

      expect(triedToSettleQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

  describe('requestExtra4WeeksQuestion', () => {
    it('should return summaryRow if requestExtra4Weeks option is yes', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.requestExtra4weeks = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS',
        'Yes',
        `/case/${claimId}/directions-questionnaire/request-extra-4-weeks`,
        changeButton,
      );

      expect(requestExtra4WeeksQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

  describe('considerClaimantDocQuestion', () => {
    it('should return summaryRow if considerClaimantDocuments option is no', () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.considerClaimantDocuments = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT',
        'No',
        `/case/${claimId}/directions-questionnaire/consider-claimant-documents`,
        changeButton,
      );

      expect(considerClaimantDocQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow for document details if considerClaimantDocuments option is Yes', () => {
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

      expect(considerClaimantDocResponse(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

  });

});
