import { ValidateIf, Validate, IsDate } from 'class-validator';
import { addDaysToDate } from 'common/utils/dateUtils';
import { DateNotBeforeReferenceDate } from 'common/form/validators/dateNotBeforeReferenceDate';
import { DateConverter } from 'common/utils/dateConverter';
import { BaseRepaymentPlanForm } from '../../repaymentPlan/baseRepaymentPlan';

export class PartialAdmissionRepaymentPlanForm extends BaseRepaymentPlanForm {
  calculateFirstPaymentDate = addDaysToDate(new Date(), 30);

  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999))
  @IsDate({ message: 'ERRORS.FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED' })
  @Validate(DateNotBeforeReferenceDate, ['calculateFirstPaymentDate'], { message: 'ERRORS.FIRST_PAYMENT_MESSAGE' })
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
