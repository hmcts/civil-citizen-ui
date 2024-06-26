import {IsDate, IsDefined, IsNotEmpty, IsNumber,Min, Validate, ValidateIf} from 'class-validator';
import {MIN_AMOUNT_VALUE} from '../../validators/validationConstraints';
import {EqualToOrLessThanPropertyValueValidator} from '../../validators/equalToOrLessThanPropertyValueValidator';
import {OptionalDateInPastValidator} from '../../validators/optionalDateInPastValidator';
import {DateConverter} from '../../../utils/dateConverter';
import { BaseDate } from './fullAdmission/baseDate';

export interface HowMuchHaveYouPaidParams {
  amount?: number;
  totalClaimAmount?: number;
  year?: string;
  month?: string;
  day?: string;
  text?: string;
}

export class HowMuchHaveYouPaid extends BaseDate {

  @IsDefined({message: 'ERRORS.VALID_AMOUNT'})
  @Min(MIN_AMOUNT_VALUE, {message: 'ERRORS.VALID_AMOUNT'})
  @IsNumber({allowNaN: false, maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Validate(EqualToOrLessThanPropertyValueValidator, ['totalClaimAmount'], {message: 'ERRORS.AMOUNT_LESS_THAN_CLAIMED'})
    amount?: number;

  totalClaimAmount?: number;

  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateInPastValidator, {message: 'ERRORS.VALID_DATE_IN_PAST'})
    date?: Date;

  @IsNotEmpty({message: 'ERRORS.ENTER_PAYMENT_EXPLANATION'})
    text?: string;

  constructor(howMuchHaveYouPaidParams?: HowMuchHaveYouPaidParams) {
    super(howMuchHaveYouPaidParams?.year, howMuchHaveYouPaidParams?.month, howMuchHaveYouPaidParams?.day);
    this.amount = howMuchHaveYouPaidParams?.amount;
    this.totalClaimAmount = howMuchHaveYouPaidParams?.totalClaimAmount;
    this.date = DateConverter.convertToDate(howMuchHaveYouPaidParams?.year, howMuchHaveYouPaidParams?.month, howMuchHaveYouPaidParams?.day);
    this.text = howMuchHaveYouPaidParams?.text;
  }
}

