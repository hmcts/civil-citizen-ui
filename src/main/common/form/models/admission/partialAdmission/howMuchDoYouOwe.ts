import {IsDefined, IsNumber, Min, Validate} from 'class-validator';
import {MIN_AMOUNT_VALUE} from '../../../validators/validationConstraints';
import {EqualToOrLessThanPropertyValueValidator} from '../../../validators/equalToOrLessThanPropertyValueValidator';

export class HowMuchDoYouOwe {
  @IsDefined({message: 'ERRORS.CLAIM_VALID_AMOUNT'})
  @Min(MIN_AMOUNT_VALUE, {message: 'ERRORS.CLAIM_VALID_AMOUNT'})
  @IsNumber({allowNaN: false, maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Validate(EqualToOrLessThanPropertyValueValidator, ['totalAmount', 'strictComparison'], {message: 'ERRORS.AMOUNT_LESS_THAN_CLAIMED'})
    amount?: number;

  totalAmount?: number;

  constructor(amount?: number, totalAmount?: number) {
    this.amount = amount;
    this.totalAmount = totalAmount;
  }
}
