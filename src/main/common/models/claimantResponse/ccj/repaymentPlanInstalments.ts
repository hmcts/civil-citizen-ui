import {IsDefined, IsNumber, Min, Validate, ValidateNested} from 'class-validator';
import {InstalmentFirstPaymentDate} from './instalmentFirstPaymentDate';
import {toNumberOrUndefined} from '../../../../common/utils/numberConverter';
import {TransactionSchedule} from '../../../form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {EqualToOrLessThanPropertyValueValidator} from '../../../form/validators/equalToOrLessThanPropertyValueValidator';

export class RepaymentPlanInstalments {
  @IsNumber({allowNaN: false, maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Min(0, {message: 'ERRORS.VALID_AMOUNT'})
  @Validate(EqualToOrLessThanPropertyValueValidator, ['totalClaimAmount', 'strictComparision'], { message: 'ERRORS.VALID_INSTALMENT_AMOUNT' })
    amount?: number;

  @ValidateNested()
    firstPaymentDate?: InstalmentFirstPaymentDate;

  @IsDefined({message: 'ERRORS.PAYMENT_FREQUENCY_REQUIRED'})
    paymentFrequency?: TransactionSchedule;

  totalClaimAmount?: number;

  constructor(amount?: string, firstPaymentDate?: InstalmentFirstPaymentDate, paymentFrequency?: TransactionSchedule, totalClaimAmount?: number) {
    this.amount = toNumberOrUndefined(amount);
    this.firstPaymentDate = firstPaymentDate;
    this.paymentFrequency = paymentFrequency;
    this.totalClaimAmount = totalClaimAmount;
  }
}
