import {IsDate, IsInt, Max, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateFourDigitValidator} from 'form/validators/optionalDateFourDigitValidator';
import {DateConverter} from 'common/utils/dateConverter';
import {OptionalDateInPastValidator} from 'form/validators/optionalDateInPastValidator';
import {toNumberOrString} from 'common/utils/numberConverter';
import {ValidationArgs} from 'common/form/models/genericForm';

const generateErrorMessage = (messageName: string): string => {
  return messageName || 'ERRORS.VALID_DATE_START_NOT_AFTER_TODAY';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<DebtRespiteStartDate>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class DebtRespiteStartDate {
  messageName?: string;

  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 1872))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateInPastValidator, {message: withMessage(generateErrorMessage)})
    date?: Date;

  @ValidateIf(o => (o.day || o.month || o.year))
  @IsInt({message: 'ERRORS.VALID_DAY'})
  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    day?: number|string;

  @ValidateIf(o => (o.day || o.month || o.year))
  @IsInt({message: 'ERRORS.VALID_MONTH'})
  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    month?: number|string;

  @ValidateIf(o => (o.day || o.month || o.year))
  @IsInt({message: 'ERRORS.VALID_YEAR'})
  @Min(1872, {message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year?: number|string;

  constructor(day?: string, month?: string, year?: string, messageName?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = toNumberOrString(year);
    this.month = toNumberOrString(month);
    this.day = toNumberOrString(day);
    this.messageName = messageName;
  }
}
