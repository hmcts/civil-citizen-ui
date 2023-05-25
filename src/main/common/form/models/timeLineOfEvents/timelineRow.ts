import {IsDate, IsDefined, IsNotEmpty, MaxLength, Validate, ValidateIf} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from '../../validators/validationConstraints';
import {DateConverter} from 'common/utils/dateConverter';
import {OptionalDateNotInFutureValidator} from 'form/validators/optionalDateNotInFutureValidator';

export class TimelineRow {
  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: 'ERRORS.DATE_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.DATE_REQUIRED'})
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.CORRECT_DATE_NOT_IN_FUTURE'})
    date?: Date;

  year?: number;
  month?: number;
  day?: number;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: 'ERRORS.DESCRIPTION_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.DESCRIPTION_REQUIRED'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.VALID_TEXT_LENGTH'})
    description?: string;

  constructor(day?: string, month?: string, year?: string, description?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.description = description;
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }

  public static buildPopulatedForm(day?: string, month?: string, year?: string, description?: string) : TimelineRow{
    return new TimelineRow(day, month, year, description);
  }

  public isEmpty(): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value?.length === 0 || value === 0 || value === null);
  }

  isAtLeastOneFieldPopulated(): boolean {
    return !this.isEmpty();
  }
}
