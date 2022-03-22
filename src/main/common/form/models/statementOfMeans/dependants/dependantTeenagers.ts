import {Form} from '../../form';
import {IsDefined, IsInt, Min, Validate} from 'class-validator';
import {NUMBER_REQUIRED, VALID_INTEGER, VALID_POSITIVE_NUMBER} from '../../../validationErrors/errorMessageConstants';
import {EqualToOrLessThanPropertyValueValidator} from '../../../validators/equalToOrLessThanPropertyValueValidator';

export class DependantTeenagers extends Form {
  @IsDefined({message: NUMBER_REQUIRED})
  @IsInt({message: VALID_INTEGER})
  @Min(0, {message: VALID_POSITIVE_NUMBER})
  @Validate(EqualToOrLessThanPropertyValueValidator, ['maxValue'])
    value: number;
  maxValue: number;

  constructor(value?: number, maxValue?: number) {
    super();
    this.value = value;
    this.maxValue = maxValue;
    console.log('constructor');
    console.log(value);
    console.log(maxValue);
  }

  getMaxValue(): number {
    return this.maxValue;
  }
}
