import {IsDate, isNumber, Max, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateFourDigitValidator} from 'form/validators/optionalDateFourDigitValidator';
import {DateConverter} from 'common/utils/dateConverter';
import {OptionalDateInPastValidator} from 'form/validators/optionalDateInPastValidator';
import {toNumberOrUndefined} from 'common/utils/numberConverter';

const generateErrorMessage = (messageName: string): string => {
  return messageName ? messageName : 'ERRORS.VALID_DATE_START_NOT_AFTER_TODAY';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: any): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class DebtRespiteStartDate {
  messageName?: string;

  @ValidateIf(o => (o.day > 0 && o.day <32 && o.month > 0 && o.month < 13 && o.year > 1872))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateInPastValidator, {message: withMessage(generateErrorMessage)})
    date?: Date;

  @ValidateIf(o => (o.day || o.month || o.year))
  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    day?: number;

  @ValidateIf(o => (o.day || o.month || o.year))
  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    month?: number;

  @ValidateIf(o => (o.day || o.month || o.year))
  @Min(1872, {message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year?: number;

  constructor(day?: string, month?: string, year?: string, messageName?: string) {
    console.log(day);
    console.log(month);
    console.log(year);
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = toNumberOrUndefined(year);
    this.month = toNumberOrUndefined(month);
    this.day = toNumberOrUndefined(day);
    this.messageName = messageName;
    if(!isNumber(day) || !isNumber(month) || !isNumber(year)){
      this.day = -1;
      this.month = -1;
      this.year = -1;
    }
  }
}
