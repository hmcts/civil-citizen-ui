import {validate} from 'class-validator';
import {UnavailableDatePeriodMediation, UnavailableDatesMediation} from 'models/mediation/unavailableDatesMediation';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {addMonths} from 'common/utils/dateUtils';

const messages = async (period: UnavailableDatePeriodMediation): Promise<string[]> => {
  const errors = await validate(period);
  return errors.flatMap(error => Object.values(error.constraints ?? {}));
};

describe('UnavailableDatePeriodMediation error messages', () => {
  it('stores mediation dates', () => {
    const period = new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE);
    expect(new UnavailableDatesMediation([period]).items).toEqual([period]);
  });

  it('asks for a single date when that date is too far ahead, in the past, or not a date', async () => {
    const period = new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE);
    period.startDay = 40;
    period.startMonth = 13;
    period.startYear = 1800;
    period.from = addMonths(new Date(), 6);

    expect(await messages(period)).toEqual(expect.arrayContaining([
      'ERRORS.CARM_VALID_DAY_FOR_UNAVAILABILITY',
      'ERRORS.CARM_VALID_MONTH_FOR_UNAVAILABILITY',
      'ERRORS.VALID_YEAR',
    ]));

    period.startDay = undefined;
    period.startMonth = undefined;
    period.startYear = undefined;
    period.from = addMonths(new Date(), 6);
    expect(await messages(period)).toContain('ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS');

    period.from = new Date('2000-01-01');
    expect(await messages(period)).toContain('ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_FUTURE');

    period.from = undefined;
    expect(await messages(period)).toContain('ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY');
  });

  it('asks for the from and to dates of a longer period', async () => {
    const ahead = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
    ahead.startDay = 40;
    ahead.startMonth = 13;
    ahead.startYear = 1800;
    ahead.from = addMonths(new Date(), 6);
    ahead.endDay = 1;

    expect(await messages(ahead)).toEqual(expect.arrayContaining([
      'ERRORS.CARM_VALID_DAY_FOR_UNAVAILABILITY_FROM',
      'ERRORS.CARM_VALID_MONTH_FOR_UNAVAILABILITY_FROM',
      'ERRORS.VALID_YEAR',
    ]));

    const fromDate = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
    fromDate.endDay = 1;
    fromDate.from = undefined;
    expect(await messages(fromDate)).toContain('ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY_FROM');

    fromDate.from = addMonths(new Date(), 6);
    expect(await messages(fromDate)).toContain('ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS_FROM');

    const missingTo = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
    missingTo.startDay = 1;
    expect(await messages(missingTo)).toContain('ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY_TO');

    const missingBoth = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
    expect(await messages(missingBoth)).toContain('ERRORS.CARM_ENTER_DATES_FOR_UNAVAILABILITY');
  });

  it('asks for the from date and both dates when a longer period has no dates entered', async () => {
    const missingBoth = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);

    expect(await messages(missingBoth)).toEqual(expect.arrayContaining([
      'ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY_FROM',
      'ERRORS.CARM_ENTER_DATES_FOR_UNAVAILABILITY',
    ]));
  });

  it('asks for a from date before the to date when the to date is complete', async () => {
    const until = addMonths(new Date(), 1);
    const period = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
    period.from = addMonths(new Date(), 2);
    period.until = until;
    period.endDay = until.getDate();
    period.endMonth = until.getMonth() + 1;
    period.endYear = until.getFullYear();

    expect(await messages(period)).toContain('ERRORS.CARM_ENTER_UNAVAILABILITY_FROM_DATE_BEFORE_TO_DATE');
  });

  it('does not compare the from and to dates when the to year is missing', async () => {
    const until = addMonths(new Date(), 1);
    const period = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
    period.from = addMonths(new Date(), 2);
    period.until = until;
    period.endDay = until.getDate();
    period.endMonth = until.getMonth() + 1;

    expect(await messages(period)).not.toContain('ERRORS.CARM_ENTER_UNAVAILABILITY_FROM_DATE_BEFORE_TO_DATE');
  });
});
