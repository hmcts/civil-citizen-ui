import {
  IsDefined,
  IsNumber,
  Min,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {EqualToOrLessThanPropertyValueValidator} from 'common/form/validators/equalToOrLessThanPropertyValueValidator';
import {MIN_AMOUNT_VALUE} from 'common/form/validators/validationConstraints';
import {YesNo} from '../../../form/models/yesNo';

// temporary stop users from choosing yes to paid amount
@ValidatorConstraint({ name: 'cannotChooseYesPaidAmount', async: false })
class PaidAmountValidator implements ValidatorConstraintInterface {
  validate(value: YesNo) {
    return value !== YesNo.YES;
  }

  defaultMessage() {
    return 'ERRORS.FEATURE_UNAVAILABLE_GUIDANCE_BELOW';
  }
}

export class PaidAmount {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION_DO_NADDO'})
  @Validate(PaidAmountValidator)
    option?: YesNo;

  totalAmount?: number;

  @ValidateIf(o => o.option === YesNo.YES)
  @IsDefined({message: 'ERRORS.INVALID_AMOUNT'})
  @Min(MIN_AMOUNT_VALUE, {message: 'ERRORS.INVALID_AMOUNT'})
  @IsNumber({allowNaN: false, maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Validate(EqualToOrLessThanPropertyValueValidator, ['totalAmount', 'strictComparison'], {message: 'ERRORS.PAID_AMOUNT_NOT_GREATER'})
    amount?: number;

  constructor(option: YesNo = undefined, amount?: number, totalAmount?: number) {
    this.option = option;
    this.amount = option === YesNo.YES ? amount : undefined;
    this.totalAmount = totalAmount;
  }
}

