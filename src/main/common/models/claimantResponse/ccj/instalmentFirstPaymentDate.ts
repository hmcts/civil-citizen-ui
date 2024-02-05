import {IsDate,MinDate,ValidateIf} from 'class-validator';
import { getFutureMonthDate } from '../../../../common/utils/dateUtils';
import {DateConverter} from '../../../../common/utils/dateConverter';
import {BaseDate} from 'common/form/models/admission/fullAdmission/baseDate';

export class InstalmentFirstPaymentDate extends BaseDate {

  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @MinDate(getFutureMonthDate(1), { message: 'ERRORS.VALID_DATE_ONE_MONTH_FROM_TODAY'})
    date?: Date;

  constructor(firstPaymentDate: Record<string,string>) {
    super(firstPaymentDate?.year, firstPaymentDate?.month, firstPaymentDate?.day);
    this.date = DateConverter.convertToDate(firstPaymentDate?.year, firstPaymentDate?.month, firstPaymentDate?.day);
  }
}