import {Min, Max, Validate, IsNotEmpty, IsDefined, IsDate, MaxLength, ValidateIf} from 'class-validator';
import {STANDARD_TEXT_INPUT_MAX_LENGTH} from '../../../../common/form/validators/validationConstraints';
import {DateConverter} from '../../../../common/utils/dateConverter';
import {OptionalDateNotInFutureValidator} from '../../../../common/form/validators/optionalDateNotInFutureValidator';
import {OptionalDateFourDigitValidator} from  '../../../../common/form/validators/optionalDateFourDigitValidator';
export class ReportDetails {
  // TODO : correct the eror message
  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: 'ERRORS.VALID_ADDRESS_LINE_1'})
  @MaxLength(STANDARD_TEXT_INPUT_MAX_LENGTH, {message: 'ERRORS.VALID_TEXT_LENGTH'})
    expertName: string;

  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999) && o.isAtLeastOneFieldPopulated())
  @IsDefined({message: 'ERRORS.DATE_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.DATE_REQUIRED'})
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.CORRECT_DATE_NOT_IN_FUTURE'})
    reportDate?: Date;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @Min(1872, {message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year: number;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    month: number;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    day: number;

  constructor(expertName?: string, year?: string, month?: string, day?: string) {
    this.expertName = expertName;
    this.reportDate = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }
  public isEmpty(): boolean {
    return Object.values(this).every(value => value === undefined || value === 0 || value === '' || value?.length === 0);
  }

  isAtLeastOneFieldPopulated(): boolean {
    return !this.isEmpty();
  }
}