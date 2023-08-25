import { IsDate, Validate, ValidateIf } from 'class-validator';
import { DateConverter } from 'common/utils/dateConverter';
import { addDaysToDate } from 'common/utils/dateUtils';
import { DateNotBeforeReferenceDate } from '../../../validators/dateNotBeforeReferenceDate';
import { BasePaymentDate } from '../fullAdmission/basePaymentDate';

export class DefendantPaymentDate extends BasePaymentDate {

  calculateFirstPaymentDate = addDaysToDate(new Date(), 30);

  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999))
  @IsDate({ message: 'ERRORS.VALID_DATE' })
  @Validate(DateNotBeforeReferenceDate, ['calculateFirstPaymentDate'], { message: 'ERRORS.FIRST_PAYMENT_MESSAGE' })
    date?: Date;

  constructor(year?: string, month?: string, day?: string) {
    super(year, month, day);
    this.date = DateConverter.convertToDate(year, month, day);
  }
}