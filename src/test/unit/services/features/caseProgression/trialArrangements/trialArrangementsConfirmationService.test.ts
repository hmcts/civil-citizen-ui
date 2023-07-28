import {
  getTrialArrangementsConfirmationContent,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationService';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Trial arrangements confirmation service', () => {
  it('should return trial arrangements confirmation content if claim is not ready for trial or hearing', () => {
    //Given
    const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    const claimId = mockClaim.id;
    const lang = 'en';
    const readyForTrialOrHearing = false;
    //When
    const trialArrangementsConfirmationContent = getTrialArrangementsConfirmationContent(claimId, mockClaim, lang, readyForTrialOrHearing);
    //Then
    expect(trialArrangementsConfirmationContent.length).toEqual(5);
    expect(trialArrangementsConfirmationContent[0].type).toEqual(ClaimSummaryType.TITLE);
    expect(trialArrangementsConfirmationContent[0].data.text).toEqual('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(trialArrangementsConfirmationContent[1].type).toEqual(ClaimSummaryType.HTML);
    expect(trialArrangementsConfirmationContent[1].data.html).toContain('<div class="warning-text-container">');
    expect(trialArrangementsConfirmationContent[1].data.html).toContain('<span class="govuk-warning-text__icon" aria-hidden="true">!</span>');
    expect(trialArrangementsConfirmationContent[1].data.html).toContain('<strong class="govuk-warning-text__text">');
    expect(trialArrangementsConfirmationContent[1].data.html).toContain('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TRIAL_OR_HEARING_WILL_GO_AHEAD_AS_PLANNED');
    expect(trialArrangementsConfirmationContent[1].data.html).toContain('</strong>');
    expect(trialArrangementsConfirmationContent[1].data.html).toContain('</div>');
    expect(trialArrangementsConfirmationContent[2].type).toEqual(ClaimSummaryType.LINK);
    expect(trialArrangementsConfirmationContent[2].data.text).toEqual('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.MAKE_AN_APPLICATION');
    expect(trialArrangementsConfirmationContent[2].data.href).toEqual('https://www.gov.uk/government/publications/form-n244-application-notice');
    expect(trialArrangementsConfirmationContent[2].data.textBefore).toEqual('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IF_YOU_WANT_THE_DATE_OF_THE_HEARING');
    expect(trialArrangementsConfirmationContent[2].data.textAfter).toEqual('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TO_THE_COURT_AND_PAY');
    expect(trialArrangementsConfirmationContent[3].type).toEqual(ClaimSummaryType.PARAGRAPH);
    expect(trialArrangementsConfirmationContent[3].data.text).toEqual('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_CALL');
    expect(trialArrangementsConfirmationContent[4].type).toEqual(ClaimSummaryType.LINK);
    expect(trialArrangementsConfirmationContent[4].data.text).toEqual('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS');
    expect(trialArrangementsConfirmationContent[4].data.href).toEqual(`/dashboard/${claimId}/defendant#documents`);
    expect(trialArrangementsConfirmationContent[4].data.textBefore).toEqual('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS');
    expect(trialArrangementsConfirmationContent[4].data.textAfter).toEqual('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS');
  });
});
