import {BreathingSpace} from 'models/breathingSpace';
import {DebtRespiteStartDate} from 'models/breathingSpace/debtRespiteStartDate';
import {
  getSummarySections,
} from 'services/features/breathingSpace/checkYourAnswer/checkYourAnswerServiceForBreathingSpaceLifted';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Get Summary Section for Lift Breathing Space Check Answer Page', () => {

  it('should return check answers page', async () => {
    //given
    const breathingSpace: BreathingSpace = {
      debtRespiteLiftDate: new DebtRespiteStartDate('29', '09', '2020'),
    };

    //when
    const summarySections = await getSummarySections('123', breathingSpace, 'en');

    //then
    expect(summarySections.summaryList.rows[0].key.text).toBe('PAGES.CLAIMANT_LIFT_BREATHING_SPACE_CHECK_ANSWER.DATE_LIFTED');
    expect(summarySections.summaryList.rows[0].value.html).toBe('29 September 2020');
    expect(summarySections.summaryList.rows[0].actions.items[0].href).toBe('/case/123/breathing-space/respite-lifted');

  });

  it('should return check answers page without Date', async () => {
    //given
    const breathingSpace: BreathingSpace = {
      debtRespiteLiftDate: new DebtRespiteStartDate(),
    };

    //when
    const summarySections = await getSummarySections('123', breathingSpace, 'en');

    //then
    expect(summarySections.summaryList.rows[0].key.text).toBe('PAGES.CLAIMANT_LIFT_BREATHING_SPACE_CHECK_ANSWER.DATE_LIFTED');
    expect(summarySections.summaryList.rows[0].value.html).toBe('');
    expect(summarySections.summaryList.rows[0].actions.items[0].href).toBe('/case/123/breathing-space/respite-lifted');

  });
});
