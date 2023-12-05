import { ValidateIf, IsDate, MinDate } from 'class-validator';
import { BaseRepaymentPlanForm } from './baseRepaymentPlan';
import { DateConverter } from 'common/utils/dateConverter';

export class RepaymentPlanForm extends BaseRepaymentPlanForm {
  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999))
  @IsDate({ message: 'ERRORS.FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED' })
  @MinDate(new Date(Date.now()), { message: 'ERRORS.FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED' })
    firstRepaymentDate?: Date;

  constructor(
    totalClaimAmount?: number,
    paymentAmount?: number,
    repaymentFrequency?: string,
    year?: string,
    month?: string,
    day?: string) {
    super(totalClaimAmount, paymentAmount, repaymentFrequency, year, month, day);
    this.firstRepaymentDate = DateConverter.convertToDate(year, month, day);
  }
}
