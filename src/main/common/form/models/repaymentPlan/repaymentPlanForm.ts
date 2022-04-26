import { IsNumber, Min, Max, IsDefined, ValidateIf, Validate, IsDate, MinDate } from 'class-validator';
import { Form } from '../form';
import {DateConverter} from '../../../utils/dateConverter';
import {
  PAYMENT_FREQUENCY_REQUIRED,
  EQUAL_INSTALMENTS_REQUIRED,
  AMOUNT_REQUIRED,
  VALID_TWO_DECIMAL_NUMBER,
  VALID_YEAR,
  VALID_MONTH,
  VALID_DAY,
  VALID_FOUR_DIGIT_YEAR,
  FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED,
} from '../../validationErrors/errorMessageConstants';
import { EqualToOrLessThanPropertyValueValidator } from '../../validators/equalToOrLessThanPropertyValueValidator';
export class RepaymentPlanForm extends Form {

  @IsDefined({ message: AMOUNT_REQUIRED })
  @IsNumber({maxDecimalPlaces: 2}, {message: VALID_TWO_DECIMAL_NUMBER})
  @Min(1, { message: AMOUNT_REQUIRED })
  @Validate(EqualToOrLessThanPropertyValueValidator, ['totalClaimAmount', 'strictComparision'], { message: EQUAL_INSTALMENTS_REQUIRED })
    paymentAmount?: number;

  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999))
  @IsDate({ message: FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED })
  @MinDate(new Date(Date.now()), { message: FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED})
    firstRepaymentDate?: Date;

  @IsDefined({ message: VALID_YEAR })
  @Min(1000, { message: VALID_FOUR_DIGIT_YEAR })
  @Max(9999,{message:VALID_YEAR})
    year?: number;

  @Min(1,{message:VALID_MONTH })
  @Max(12,{message:VALID_MONTH })
    month?: number;

  @Min(1,{message:VALID_DAY })
  @Max(31,{message:VALID_DAY })
    day?: number;

  @IsDefined({ message: PAYMENT_FREQUENCY_REQUIRED })
    repaymentFrequency?: string;

  totalClaimAmount?: number;

  constructor(
    totalClaimAmount?: number,
    paymentAmount?: number,
    repaymentFrequency?: string,
    year?: string,
    month?: string,
    day?: string) {

    super();
    this.totalClaimAmount = totalClaimAmount;
    this.paymentAmount = paymentAmount ? Number(paymentAmount) : undefined;
    this.repaymentFrequency = repaymentFrequency;
    this.firstRepaymentDate = DateConverter.convertToDate(year, month, day);
    this.year = year ? Number(year) : undefined;
    this.month = month ? Number(month) : undefined;
    this.day = day ? Number(day) : undefined;
  }

  convertToString(property:number): string {
    return property === undefined ? '' : String(property);
  }

  getPaymentAmountAsString(): string {
    return this.convertToString(this.paymentAmount);
  }

  getYearAsString(): string {
    return this.convertToString(this.year);
  }

  getMonthAsString(): string {
    return this.convertToString(this.month);
  }

  getDayAsString(): string {
    return this.convertToString(this.day);
  }
}
