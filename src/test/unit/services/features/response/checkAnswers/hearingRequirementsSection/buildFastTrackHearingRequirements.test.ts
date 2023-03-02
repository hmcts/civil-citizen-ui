import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo} from 'form/models/yesNo';
import {summaryRow} from 'models/summaryList/summaryList';
import {
  considerClaimantDocQuestion,
  considerClaimantDocResponse,
  requestExtra4WeeksQuestion,
  triedToSettleQuestion,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildFastTrackHearingRequirements';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

export const getClaimWithDirectionQuestionnaire = (): Claim => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  return claim;
};
export const getClaimWithDirectionQuestionnaireAndHearing = (): Claim => {
  const claim = getClaimWithDirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();
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
      it('should return summaryRow if triedToSettle option is no', () => {
        //Given
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
      it('should return No when direction questionnaire hearing is undefined', () => {
        //Given
        const claimWithNoHearing = new Claim();
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE',
          'COMMON.NO',
          `/case/${claimId}/directions-questionnaire/tried-to-settle`,
          changeButton,
        );
        //When
        const row = triedToSettleQuestion(claimWithNoHearing, claimId, lng);
        //Then
        expect(row).toStrictEqual(mockSummarySection);
      });
      it('should return No when hearing is undefined', () => {
        //Given
        claim.directionQuestionnaire.hearing = undefined;
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE',
          'COMMON.NO',
          `/case/${claimId}/directions-questionnaire/tried-to-settle`,
          changeButton,
        );
        //When
        const row = triedToSettleQuestion(claim, claimId, lng);
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
        expect(requestExtra4WeeksQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
        const row = requestExtra4WeeksQuestion(claimWithNoHearing, claimId, lng);
        //Then
        expect(row).toStrictEqual(mockSummarySection);
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
        expect(considerClaimantDocQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
        expect(considerClaimantDocQuestion(claimWithNoHearing, claimId, lng)).toStrictEqual(mockSummarySection);
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
        expect(considerClaimantDocResponse(claim, claimId, lng)).toStrictEqual(mockSummarySection);
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
        expect(considerClaimantDocResponse(claim, claimId, lng)).toStrictEqual(mockSummarySection);
      });
      it('should return empty string when no hearing', () => {
        //Given
        const claimWithNoHearing = new Claim();
        const mockSummarySection = summaryRow(
          'PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS',
          '',
        );
        //Then
        expect(considerClaimantDocResponse(claimWithNoHearing, claimId, lng)).toStrictEqual(mockSummarySection);
      });

    });

  });
});
