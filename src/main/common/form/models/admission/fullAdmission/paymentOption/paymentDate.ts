import { IsDate, Validate, ValidateIf } from 'class-validator';
import { DateConverter } from 'common/utils/dateConverter';
import { OptionalDateNotInPastValidator } from 'common/form/validators/optionalDateNotInPastValidator';
import { BaseDate } from '../baseDate';

export class PaymentDate extends BaseDate {

  @ValidateIf(o => (o.day > 0 && o.day <32 && o.month > 0 && o.month < 13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.VALID_DATE_NOT_IN_PAST'})
    date?: Date;

  constructor(year?: string, month?: string, day?: string) {
    super(year, month, day);
    this.date = DateConverter.convertToDate(year, month, day);

  }
}
