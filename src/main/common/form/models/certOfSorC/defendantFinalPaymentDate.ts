import {IsDefined, Validate, ValidateIf} from 'class-validator';
import { DateConverter } from 'common/utils/dateConverter';
import { OptionalDateNotInFutureValidator } from 'common/form/validators/optionalDateNotInFutureValidator';
import { BaseDate } from '../admission/fullAdmission/baseDate';

export class DefendantFinalPaymentDate extends BaseDate {

  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999) ||
    (!o.day && !o.month && !o.year))
  @IsDefined({message: 'ERRORS.VALID_FINAL_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.VALID_DATE_NOT_IN_THE_FUTURE'})
    date?: Date;

  constructor(year?: string, month?: string, day?: string) {
    super(year, month, day);
    this.date = DateConverter.convertToDate(year, month, day);

  }
}
