import {Min, Max, Validate, IsNotEmpty, IsDefined, IsDate, MaxLength, ValidateIf} from 'class-validator';
import {STANDARD_TEXT_INPUT_MAX_LENGTH} from '../../../../form/validators/validationConstraints';
import {DateConverter} from '../../../../utils/dateConverter';
import {OptionalDateNotInFutureValidator} from '../../../../form/validators/optionalDateNotInFutureValidator';
import {OptionalDateFourDigitValidator} from  '../../../../form/validators/optionalDateFourDigitValidator';
export class ReportDetail {
  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: 'ERRORS.EXPERT_NAME_REQUIRED'})
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

  static fromObject(value?: Record<string, string>): ReportDetail {
    const expertName = value.expertName;
    const year = value.year;
    const month = value.month;
    const day = value.day;
    return new ReportDetail(expertName, year, month, day);
  }

  static fromJson(value?: ReportDetail): ReportDetail {
    const reportDate = new Date(value.reportDate);
    const expertName = value.expertName;
    const year = reportDate.getFullYear().toString();
    const month = (reportDate.getMonth() + 1).toString();
    const day = reportDate.getDate().toString();
    return new ReportDetail(expertName, year, month, day);
  }

  public isEmpty(): boolean {
    return Object.values(this).every(value => value === undefined || value === 0 || value === '' || value?.length === 0);
  }

  public static buildEmptyForm(): ReportDetail {
    return new ReportDetail('', '', '', '');
  }

  isAtLeastOneFieldPopulated(): boolean {
    return !this.isEmpty();
  }
}