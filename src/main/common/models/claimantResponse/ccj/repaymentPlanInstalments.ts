import {IsDefined, IsNumber, Min, ValidateNested} from 'class-validator';
import {toNumberOrUndefined} from '../../../../common/utils/numberConverter';
import {PaymentDate} from '../../../form/models/admission/fullAdmission/paymentOption/paymentDate';
import {TransactionSchedule} from '../../../form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

export class RepaymentPlanInstalments {
  @IsNumber({allowNaN: false, maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Min(0, {message: 'ERRORS.VALID_AMOUNT'})
    amount?: number;

  @ValidateNested()
    firstPaymentDate?: PaymentDate;

  @IsDefined({message: 'ERRORS.PAYMENT_FREQUENCY_REQUIRED'})
    paymentFrequency?: TransactionSchedule;

  constructor(amount?: string, firstPaymentDate?: PaymentDate, paymentFrequency?: TransactionSchedule) {
    this.amount = toNumberOrUndefined(amount);
    this.firstPaymentDate = firstPaymentDate;
    this.paymentFrequency = paymentFrequency;
  }
}
