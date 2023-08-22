import { Max, Min, Validate } from 'class-validator';
import { OptionalDateFourDigitValidator } from 'form/validators/optionalDateFourDigitValidator';
import { toNumberOrUndefined } from 'common/utils/numberConverter';

export class BasePaymentDate {

  @Min(1, { message: 'ERRORS.VALID_DAY' })
  @Max(31, { message: 'ERRORS.VALID_DAY' })
    day: number;

  @Min(1, { message: 'ERRORS.VALID_MONTH' })
  @Max(12, { message: 'ERRORS.VALID_MONTH' })
    month: number;

  @Validate(OptionalDateFourDigitValidator, { message: 'ERRORS.VALID_FOUR_DIGIT_YEAR' })
  @Max(9999, { message: 'ERRORS.VALID_YEAR' })
    year: number;

  constructor(year?: string, month?: string, day?: string) {
    this.year = toNumberOrUndefined(year);
    this.month = toNumberOrUndefined(month);
    this.day = toNumberOrUndefined(day);
  }
}
