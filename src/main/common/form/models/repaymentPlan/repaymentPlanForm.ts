import { IsNumber, Min, Max, IsDefined, ValidateIf, Validate, IsDate, MinDate } from 'class-validator';
import {DateConverter} from '../../../utils/dateConverter';
import { EqualToOrLessThanPropertyValueValidator } from '../../validators/equalToOrLessThanPropertyValueValidator';
export class RepaymentPlanForm{

  @IsDefined({ message: 'ERRORS.AMOUNT_REQUIRED' })
  @IsNumber({maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Min(1, { message: 'ERRORS.AMOUNT_REQUIRED' })
  @Validate(EqualToOrLessThanPropertyValueValidator, ['totalClaimAmount', 'strictComparision'], { message: 'ERRORS.EQUAL_INSTALMENTS_REQUIRED' })
    paymentAmount?: number;

  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999))
  @IsDate({ message: 'ERRORS.FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED' })
  @MinDate(new Date(Date.now()), { message: 'ERRORS.FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED'})
    firstRepaymentDate?: Date;

  @Min(1,{message:'ERRORS.VALID_DAY' })
  @Max(31,{message:'ERRORS.VALID_DAY' })
    day?: number;

  @Min(1,{message:'ERRORS.VALID_MONTH' })
  @Max(12,{message:'ERRORS.VALID_MONTH' })
    month?: number;

  @IsDefined({ message: 'ERRORS.VALID_YEAR' })
  @Min(1000, { message: 'ERRORS.VALID_FOUR_DIGIT_YEAR' })
  @Max(9999,{message:'ERRORS.VALID_YEAR'})
    year?: number;

  @IsDefined({ message: 'ERRORS.PAYMENT_FREQUENCY_REQUIRED' })
    repaymentFrequency?: string;

  totalClaimAmount?: number;

  constructor(
    totalClaimAmount?: number,
    paymentAmount?: number,
    repaymentFrequency?: string,
    year?: string,
    month?: string,
    day?: string) {

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
