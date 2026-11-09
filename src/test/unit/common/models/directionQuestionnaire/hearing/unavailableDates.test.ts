import {GenericForm} from 'form/models/genericForm';
import {
  UnavailableDatePeriod,
  UnavailableDateType,
} from 'models/directionsQuestionnaire/hearing/unavailableDates';

const nextYear = String(new Date().getFullYear() + 1);

const getErrorText = (form: GenericForm<UnavailableDatePeriod>, property: string) =>
  form.getAllErrors().find(error => error.property === property)?.text;

describe('UnavailableDatePeriod', () => {

  it('should return error message for until when end date is invalid for longer period', () => {
    //Given
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1);
    const from = {day: String(startDate.getDate()), month: String(startDate.getMonth() + 1), year: String(startDate.getFullYear())};
    const until = {day: '31', month: '2', year: nextYear};
    const form = new GenericForm(new UnavailableDatePeriod(UnavailableDateType.LONGER_PERIOD, from, until));
    //When
    form.validateSync();
    //Then
    expect(getErrorText(form, 'until')).toBe('ERRORS.ENTER_DATE_FOR_UNAVAILABILITY_TO');
  });

  it('should return error message for from when start date does not exist and no end date for longer period', () => {
    //Given
    const from = {day: '31', month: '2', year: nextYear};
    const form = new GenericForm(new UnavailableDatePeriod(UnavailableDateType.LONGER_PERIOD, from, {}));
    //When
    form.validateSync();
    //Then
    expect(getErrorText(form, 'from')).toBe('ERRORS.ENTER_DATE_FOR_UNAVAILABILITY_FROM');
  });

  it('should return a single error for until and a blank error for from when both dates are empty for longer period', () => {
    //Given
    const form = new GenericForm(new UnavailableDatePeriod(UnavailableDateType.LONGER_PERIOD, {}, {}));
    //When
    form.validateSync();
    //Then
    expect(getErrorText(form, 'from')).toBe('');
    expect(getErrorText(form, 'until')).toBe('ERRORS.ENTER_DATES_FOR_UNAVAILABILITY');
  });

  it('should return error message for from when start date is empty and end date is entered for longer period', () => {
    //Given
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const until = {day: String(endDate.getDate()), month: String(endDate.getMonth() + 1), year: String(endDate.getFullYear())};
    const form = new GenericForm(new UnavailableDatePeriod(UnavailableDateType.LONGER_PERIOD, {}, until));
    //When
    form.validateSync();
    //Then
    expect(getErrorText(form, 'from')).toBe('ERRORS.ENTER_DATE_FOR_UNAVAILABILITY_FROM');
  });

  it('should return future date error for from when start date is in the past for longer period', () => {
    //Given
    const from = {day: '1', month: '1', year: '2020'};
    const form = new GenericForm(new UnavailableDatePeriod(UnavailableDateType.LONGER_PERIOD, from, {}));
    //When
    form.validateSync();
    //Then
    expect(getErrorText(form, 'from')).toBe('ERRORS.ENTER_UNAVAILABILITY_DATE_IN_FUTURE_FROM');
  });
});
