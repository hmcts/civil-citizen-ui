import {Form} from '../../form';
import {IsDefined, IsNumber, Min, Validate} from 'class-validator';
import {NUMBER_REQUIRED, VALID_INTEGER, VALID_POSITIVE_NUMBER} from '../../../validationErrors/errorMessageConstants';
import {EqualToOrLessThanPropertyValueValidator} from '../../../validators/equalToOrLessThanPropertyValueValidator';

export class DependantTeenagers extends Form {
  @IsDefined({message: NUMBER_REQUIRED})
  @IsNumber({allowNaN: false, maxDecimalPlaces: 0}, {message: VALID_INTEGER})
  @Validate(EqualToOrLessThanPropertyValueValidator, ['maxValue'])
  @Min(0, {message: VALID_POSITIVE_NUMBER})
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
