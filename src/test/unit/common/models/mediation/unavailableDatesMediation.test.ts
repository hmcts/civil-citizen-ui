import {GenericForm} from 'common/form/models/genericForm';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {
  UnavailableDatePeriodMediation,
  UnavailableDatesMediation,
} from 'models/mediation/unavailableDatesMediation';

describe('UnavailableDatesMediation', () => {
  beforeEach(() => { jest.useFakeTimers().setSystemTime(new Date(2026, 9, 21, 12)); });
  afterEach(() => { jest.useRealTimers(); });

  it('constructs with items', () => {
    const period = new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE, {
      day: '10',
      month: '6',
      year: '2099',
    });
    const model = new UnavailableDatesMediation([period]);

    expect(model.items).toHaveLength(1);
    expect(model.items![0].type).toBe(UnavailableDateType.SINGLE_DATE);
  });

  it('maps from and until params on UnavailableDatePeriodMediation', () => {
    const period = new UnavailableDatePeriodMediation(
      UnavailableDateType.LONGER_PERIOD,
      {day: '1', month: '6', year: '2099'},
      {day: '5', month: '6', year: '2099'},
    );

    expect(period.startDay).toBe(1);
    expect(period.startMonth).toBe(6);
    expect(period.startYear).toBe(2099);
    expect(period.endDay).toBe(5);
    expect(period.endMonth).toBe(6);
    expect(period.endYear).toBe(2099);
    expect(period.from).toBeInstanceOf(Date);
    expect(period.until).toBeInstanceOf(Date);
  });

  describe('validation error messages', () => {
    it('uses single-date day/month/year messages when start fields are invalid', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE);
      // ValidateIf needs at least one truthy start field; 0 fails @Min(1)
      period.startDay = 0;
      period.startMonth = 1;
      period.startYear = 2099;
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('startDay')).toBe('ERRORS.CARM_ENTER_DAY_FOR_UNAVAILABILITY');
    });

    it('uses from-date day/month/year messages for longer periods', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
      period.startDay = 0;
      period.startMonth = 1;
      period.startYear = 2099;
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('startDay')).toBe('ERRORS.CARM_ENTER_DAY_FOR_UNAVAILABILITY_FROM');
    });

    it('uses single-date month and year messages', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE);
      period.startDay = 1;
      period.startMonth = 0;
      period.startYear = 99;
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('startMonth')).toBe('ERRORS.CARM_ENTER_MONTH_FOR_UNAVAILABILITY');
      expect(form.errorFor('startYear')).toBe('ERRORS.CARM_ENTER_YEAR_FOR_UNAVAILABILITY');
    });

    it('uses longer-period month and year from messages', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
      period.startDay = 1;
      period.startMonth = 0;
      period.startYear = 99;
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('startMonth')).toBe('ERRORS.CARM_ENTER_MONTH_FOR_UNAVAILABILITY_FROM');
      expect(form.errorFor('startYear')).toBe('ERRORS.CARM_ENTER_YEAR_FOR_UNAVAILABILITY_FROM');
    });

    it('uses max-date message for a single date too far ahead', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE, {
        day: '1',
        month: '1',
        year: '2100',
      });
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('from')).toBe('ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS');
    });

    it('uses from max-date message for a longer period start too far ahead', async () => {
      const period = new UnavailableDatePeriodMediation(
        UnavailableDateType.LONGER_PERIOD,
        {day: '1', month: '1', year: '2100'},
        {day: '2', month: '1', year: '2100'},
      );
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('from')).toBe('ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS_FROM');
    });

    it('requires a to-date when a from-date is partially provided on longer period', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD, {
        day: '10',
        month: '6',
        year: '2099',
      });
      period.until = undefined;
      period.endDay = undefined;
      period.endMonth = undefined;
      period.endYear = undefined;
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('until')).toBeTruthy();
    });

    it('uses past-date message for a single date in the past', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE, {
        day: '1',
        month: '1',
        year: '2020',
      });
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('from')).toBe('ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_FUTURE');
    });

    it('uses past-date message for a longer period start in the past', async () => {
      const period = new UnavailableDatePeriodMediation(
        UnavailableDateType.LONGER_PERIOD,
        {day: '1', month: '1', year: '2020'},
        {day: '2', month: '1', year: '2020'},
      );
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('from')).toBe('ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_FUTURE_FROM');
    });

    it('uses until messages when to-date is missing on a longer period', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
      period.startDay = 10;
      period.startMonth = 6;
      period.startYear = 2099;
      period.from = new Date('2099-06-10');
      period.until = undefined as unknown as Date;
      period.endDay = undefined;
      period.endMonth = undefined;
      period.endYear = undefined;
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('until')).toBe('ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY_TO');
    });

    it('uses both-dates message when from and until are missing on longer period', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
      period.startDay = undefined;
      period.startMonth = undefined;
      period.startYear = undefined;
      period.endDay = undefined;
      period.endMonth = undefined;
      period.endYear = undefined;
      period.from = undefined as unknown as Date;
      period.until = undefined as unknown as Date;
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('until')).toBe('ERRORS.CARM_ENTER_DATES_FOR_UNAVAILABILITY');
    });

    it('uses from-date IsDate message when longer period has until fields but invalid from', async () => {
      const period = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD);
      period.startDay = undefined;
      period.startMonth = undefined;
      period.startYear = undefined;
      period.from = undefined as unknown as Date;
      period.endDay = 5;
      period.endMonth = 6;
      period.endYear = 2099;
      period.until = new Date('2099-06-05');
      const form = new GenericForm(period);

      await form.validate();

      expect(form.errorFor('from')).toBe('ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY_FROM');
    });
  });
});
