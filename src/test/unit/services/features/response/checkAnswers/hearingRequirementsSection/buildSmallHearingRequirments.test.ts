import {Claim} from 'models/claim';
import {
  DirectionQuestionnaire,
} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {summaryRow} from 'models/summaryList/summaryList';
import {YesNo} from 'form/models/yesNo';
import {DeterminationWithoutHearing} from 'models/directionsQuestionnaire/hearing/determinationWithoutHearing';
import {
  determinationWithoutHearingQuestion,
  determinationWithoutHearingReason,
} from 'services/features/common/buildSmallClaimHearingRequirements';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Small Claim Hearing Requirements Section', () => {
  const claimId = 'validClaimId';
  const lng = 'cimode';
  const changeButton = 'COMMON.BUTTONS.CHANGE';

  describe('determinationWithoutHearingQuestion', () => {
    it('should return summaryRow if determination without hearing option is no', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
        'COMMON.VARIATION_2.NO',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(determinationWithoutHearingQuestion(claim, claimId, lng,claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if determination without hearing option is yes', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
        'COMMON.VARIATION_2.YES',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(determinationWithoutHearingQuestion(claim, claimId, lng,claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });
  });

  describe('determinationWithoutHearingReason', () => {
    it('should return summaryRow if determination without hearing reason is set', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = new DeterminationWithoutHearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing.option = YesNo.NO;
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {
        reasonForHearing: 'my reason',
      };
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY',
        'my reason',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(determinationWithoutHearingReason(claim, claimId, lng,claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if determination without hearing reason is not set', () => {
      //Given
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.hearing = new Hearing();
      claim.directionQuestionnaire.hearing.determinationWithoutHearing = {};
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY',
        '',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(determinationWithoutHearingReason(claim, claimId, lng,claim.directionQuestionnaire)).toStrictEqual(mockSummarySection);
    });
  });
});
