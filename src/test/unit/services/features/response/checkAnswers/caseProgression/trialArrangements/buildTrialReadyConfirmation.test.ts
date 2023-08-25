import {HAS_ANYTHING_CHANGED_URL, IS_CASE_READY_URL, TRIAL_ARRANGEMENTS_HEARING_DURATION} from 'routes/urls';
import {
  getClaimWithDefendantTrialArrangements,
} from '../../../../../../../utils/mockClaimForCheckAnswers';
import {
  buildIsCaseReadyForTrialOrHearing,
} from 'services/features/response/checkAnswers/caseProgression/trialArrangements/buildTrialReadyConfirmationSection';

jest.mock('../../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const claimId = '11';
const HAS_ANYTHING_CHANGED_HTML = '<p>COMMON.YES</p><hr class="govuk-section-break--visible--l" ><p>Changed</p>';
describe('Trial ready summary details section', () => {
  const claim = getClaimWithDefendantTrialArrangements();
  it('should return trial ready summary sections', async () => {
    //When
    const summarySections = await buildIsCaseReadyForTrialOrHearing(claim, claimId, 'en');
    //Then
    expect(summarySections.summaryList.rows.length).toBe(3);
    expect(summarySections.summaryList.rows[0].value.html).toBe('COMMON.YES');
    expect(summarySections.summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.summaryList.rows[0].actions?.items[0].href).toBe(IS_CASE_READY_URL.replace(':id', claimId));
    expect(summarySections.summaryList.rows[1].value.html).toBe(HAS_ANYTHING_CHANGED_HTML);
    expect(summarySections.summaryList.rows[1].actions?.items.length).toBe(1);
    expect(summarySections.summaryList.rows[1].actions?.items[0].href).toBe(HAS_ANYTHING_CHANGED_URL.replace(':id', claimId));
    expect(summarySections.summaryList.rows[2].value.html).toBe('Other Information');
    expect(summarySections.summaryList.rows[2].actions?.items[0].href).toBe(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', claimId));
  });
});
