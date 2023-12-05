import {
  getTrialArrangementsConfirmationContent,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationService';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {DEFENDANT_SUMMARY_TAB_URL} from 'routes/urls';
import {TabId} from 'routes/tabs';

const TITLE = 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.WHAT_HAPPENS_NEXT';
const DOCUMENT = 'https://www.gov.uk/government/publications/form-n244-application-notice';

describe('Trial arrangements confirmation service', () => {
  it('should return trial arrangements confirmation content if claim is ready for trial or hearing', () => {
    //Given
    const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    const claimId = mockClaim.id;
    const readyForTrialOrHearing = true;
    const readyTrialArrangementsConfirmationContentExpected = new FinaliseYourTrialSectionBuilder()
      .addMainTitle(TITLE)
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS',
        DEFENDANT_SUMMARY_TAB_URL.replace(':id', claimId).replace(':tab', TabId.NOTICES),
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS')
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.MAKE_AN_APPLICATION',
        DOCUMENT,
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IF_THERE_ARE_ANY_CHANGES_TO_THE_ARRANGEMENTS',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.AS_SOON_AS_POSSIBLE_AND_PAY',
        '',
        true)
      .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_PHONE')
      .build();
    //When
    const readyTrialArrangementsConfirmationContent = getTrialArrangementsConfirmationContent(claimId, mockClaim, readyForTrialOrHearing);
    //Then
    expect(readyTrialArrangementsConfirmationContent.length).toEqual(4);
    expect(readyTrialArrangementsConfirmationContentExpected).toEqual(readyTrialArrangementsConfirmationContent);

  });
  it('should return trial arrangements confirmation content if claim is not ready for trial or hearing', () => {
    //Given
    const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    const claimId = mockClaim.id;
    const readyForTrialOrHearing = false;
    const trialArrangementsConfirmationContentExpected = new FinaliseYourTrialSectionBuilder()
      .addMainTitle(TITLE)
      .addWarning('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TRIAL_OR_HEARING_WILL_GO_AHEAD_AS_PLANNED')
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.MAKE_AN_APPLICATION',
        DOCUMENT,
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IF_YOU_WANT_THE_DATE_OF_THE_HEARING',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TO_THE_COURT_AND_PAY',
        '',
        true)
      .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_CALL')
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS',
        DEFENDANT_SUMMARY_TAB_URL.replace(':id', claimId).replace(':tab', TabId.NOTICES),
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS')
      .build();
    //When
    const trialArrangementsConfirmationContent = getTrialArrangementsConfirmationContent(claimId, mockClaim, readyForTrialOrHearing);
    //Then
    expect(trialArrangementsConfirmationContent.length).toEqual(5);
    expect(trialArrangementsConfirmationContentExpected).toEqual(trialArrangementsConfirmationContent);
  });
});
