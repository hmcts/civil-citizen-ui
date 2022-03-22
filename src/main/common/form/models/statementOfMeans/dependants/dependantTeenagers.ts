import {Form} from '../../form';
import {IsDefined, IsInt, IsPositive, Validate} from 'class-validator';
import {NUMBER_REQUIRED, VALID_INTEGER, VALID_POSITIVE_NUMBER} from '../../../validationErrors/errorMessageConstants';
import {EqualToOrLessThanPropertyValueValidator} from '../../../validators/equalToOrLessThanPropertyValueValidator';

export class DependantTeenagers extends Form {
  @IsDefined({message: NUMBER_REQUIRED})
  @IsInt({message: VALID_INTEGER})
  @IsPositive({message: VALID_POSITIVE_NUMBER})
  @Validate(EqualToOrLessThanPropertyValueValidator, ['maxValue'])
    value: number;
  maxValue: number;

  constructor(value?: number, maxValue?: number) {
    super();
    this.value = value;
    this.maxValue = maxValue;
  }

  getMaxValue(): number {
    return this.maxValue;
  }
}
