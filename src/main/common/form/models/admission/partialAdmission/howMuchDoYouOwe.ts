import {Validate, IsDefined, IsNumber, Min} from 'class-validator';
import {VALID_TWO_DECIMAL_NUMBER,
  VALID_AMOUNT, AMOUNT_LESS_THEN_CLAIMED} from '../../../validationErrors/errorMessageConstants';
import {MIN_AMOUNT_VALUE} from '../../../validators/validationConstraints';
import {EqualToOrLessThanPropertyValueValidator} from '../../../validators/equalToOrLessThanPropertyValueValidator';
import {Form} from '../../form';

export class HowMuchDoYouOwe extends Form {

  @IsDefined({ message: VALID_AMOUNT })
  @Min(MIN_AMOUNT_VALUE, { message: VALID_AMOUNT })
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 }, { message: VALID_TWO_DECIMAL_NUMBER })
  @Validate(EqualToOrLessThanPropertyValueValidator, ['totalAmount', 'strictComparision'], { message: AMOUNT_LESS_THEN_CLAIMED })
    amount?: number;

  totalAmount?: number;

  constructor(amount?: number, totalAmount?: number) {
    super();
    this.amount = amount;
    this.totalAmount = totalAmount;
  }
}
