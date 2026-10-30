import {GenericForm} from 'form/models/genericForm';
import {
  UnavailableDatePeriod,
  UnavailableDateType,
} from 'models/directionsQuestionnaire/hearing/unavailableDates';

const nextYear = String(new Date().getFullYear() + 1);

const getErrorText = (form: GenericForm<UnavailableDatePeriod>, property: string) =>
  form.getAllErrors().find(error => error.property === property)?.text;

describe('UnavailableDatePeriod', () => {

  it('should return error message for until when end date does not exist for longer period', () => {
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
});
