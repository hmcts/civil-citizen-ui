import {IsDefined, IsNumber, Min, Validate} from 'class-validator';
import {
  AMOUNT_LESS_THAN_CLAIMED,
  CLAIM_VALID_AMOUNT,
  VALID_TWO_DECIMAL_NUMBER,
} from '../../../validationErrors/errorMessageConstants';
import {MIN_AMOUNT_VALUE} from '../../../validators/validationConstraints';
import {EqualToOrLessThanPropertyValueValidator} from '../../../validators/equalToOrLessThanPropertyValueValidator';
import {Form} from '../../form';

export class HowMuchDoYouOwe extends Form {

  @IsDefined({ message: CLAIM_VALID_AMOUNT })
  @Min(MIN_AMOUNT_VALUE, { message: CLAIM_VALID_AMOUNT })
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 }, { message: VALID_TWO_DECIMAL_NUMBER })
  @Validate(EqualToOrLessThanPropertyValueValidator, ['totalAmount', 'strictComparison'], { message: AMOUNT_LESS_THAN_CLAIMED })
    amount?: number;

  totalAmount?: number;

  constructor(amount?: number, totalAmount?: number) {
    super();
    this.amount = amount;
    this.totalAmount = totalAmount;
  }
}
