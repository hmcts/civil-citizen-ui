import {IsDefined, IsNumber, Min, ValidateNested} from 'class-validator';
import {PaymentFrequencyType} from './paymentFrequencyType';
import {toNumberOrUndefined} from '../../../../common/utils/numberConverter';
import {PaymentDate} from '../../../form/models/admission/fullAdmission/paymentOption/paymentDate';

export class RepaymentPlanInstalments {
  @IsNumber({allowNaN: false, maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Min(0, {message: 'ERRORS.VALID_AMOUNT'})
    amount?: number;

  @ValidateNested()
    firstPaymentDate?: PaymentDate;

  @IsDefined({message: 'ERRORS.PAYMENT_FREQUENCY_REQUIRED'})
    paymentFrequency?: PaymentFrequencyType;

  constructor(amount?: string, firstPaymentDate?: PaymentDate, paymentFrequency?: PaymentFrequencyType) {
    this.amount = toNumberOrUndefined(amount);
    this.firstPaymentDate = firstPaymentDate;
    this.paymentFrequency = paymentFrequency;
  }
}
