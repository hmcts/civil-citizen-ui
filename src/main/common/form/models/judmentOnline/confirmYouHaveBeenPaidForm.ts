import {IsDate, IsDefined, IsNotEmpty, Validate, ValidateIf, ValidateNested} from 'class-validator';
import {OptionalDateNotInFutureValidator} from 'form/validators/optionalDateNotInFutureValidator';
import {DateDayValidator} from 'form/validators/dateDayValidator';
import {DateMonthValidator} from 'form/validators/dateMonthValidator';
import {DateYearValidator} from 'form/validators/dateYearValidator';
import {DateConverter} from 'common/utils/dateConverter';

export class DateYouHaveBeenPaidForm {
  @ValidateNested()
    dateInputFields: DateInputField;

  constructor(day?: string, month?: string, year?: string) {
    this.dateInputFields = new DateInputField(day, month, year);
  }
}

export class DateInputField {
  @ValidateIf(o => ((o.dateDay !== undefined && o.dateMonth !== undefined && o.dateDay && o.dateMonth && o.dateYear && o.dateDay > 0 && o.dateDay < 32 && o.dateMonth > 0 && o.dateMonth < 13 && o.dateYear > 999)
      || (o.dateDay !== undefined && o.dateMonth !== undefined && !o.dateDay && !o.dateMonth && !o.dateYear)))
  @IsDefined({message: 'ERRORS.MEDIATION_VALID_YOU_MUST_ENTER_DOI'})
  @IsNotEmpty({message: 'ERRORS.MEDIATION_VALID_YOU_MUST_ENTER_DOI'})
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.VALID_DATE_NOT_FUTURE'})
    date: Date;

  @ValidateIf(o => (o.dateDay || o.dateMonth || o.dateYear))
  @Validate(DateDayValidator)
    dateDay: string;

  @ValidateIf(o => (o.dateDay || o.dateMonth || o.dateYear))
  @Validate(DateMonthValidator)
    dateMonth: string;

  @ValidateIf(o => (o.dateDay || o.dateMonth || o.dateYear))
  @Validate(DateYearValidator)
    dateYear: string;

  constructor(day?: string, month?: string, year?: string) {
    if (day !== undefined && month !== undefined && year != undefined) {
      this.dateDay = day;
      this.dateMonth = month;
      this.dateYear = year;
      this.date = DateConverter.convertToDate(year, month, day);
    }
  }
}
