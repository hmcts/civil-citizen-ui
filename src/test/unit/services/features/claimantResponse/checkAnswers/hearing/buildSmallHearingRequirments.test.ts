import {Claim} from '../../../../../../../main/common/models/claim';
import {
  DirectionQuestionnaire,
} from '../../../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {summaryRow} from 'models/summaryList/summaryList';
import {YesNo} from 'form/models/yesNo';
import {DeterminationWithoutHearing} from 'models/directionsQuestionnaire/hearing/determinationWithoutHearing';
import {
  determinationWithoutHearingQuestion, determinationWithoutHearingReason,
} from 'services/features/claimantResponse/checkAnswers/hearing/buildSmallClaimHearingRequirements';
import {ClaimantResponse} from 'models/claimantResponse';

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
      claim.claimantResponse=new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.NO,
      };
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
        'COMMON.NO',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(determinationWithoutHearingQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if determination without hearing option is yes', () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse=new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: YesNo.YES,
      };
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARINGPAGES.DETERMINATION_WITHOUT_HEARING.IE',
        'COMMON.YES',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(determinationWithoutHearingQuestion(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });

  describe('determinationWithoutHearingReason', () => {
    it('should return summaryRow if determination without hearing reason is set', () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse=new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = new DeterminationWithoutHearing();
      claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing.option = YesNo.NO;
      claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {
        reasonForHearing: 'my reason',
      };
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY',
        'my reason',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(determinationWithoutHearingReason(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });

    it('should return summaryRow if determination without hearing reason is not set', () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse=new ClaimantResponse();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {};
      const mockSummarySection = summaryRow(
        'PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY',
        '',
        `/case/${claimId}/directions-questionnaire/determination-without-hearing`,
        changeButton,
      );
      //Then
      expect(determinationWithoutHearingReason(claim, claimId, lng)).toStrictEqual(mockSummarySection);
    });
  });
});
