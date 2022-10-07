import {IsDefined, IsNumber, Min, Validate} from 'class-validator';
import {EqualToOrLessThanPropertyValueValidator} from '../../../validators/equalToOrLessThanPropertyValueValidator';

export class BetweenSixteenAndNineteenDependants {
  @IsDefined({message: 'ERRORS.VALID_INTEGER'})
  @IsNumber({allowNaN: false, maxDecimalPlaces: 0}, {message: 'ERRORS.VALID_INTEGER'})
  @Validate(EqualToOrLessThanPropertyValueValidator, ['maxValue'])
  @Min(0, {message: 'ERRORS.VALID_POSITIVE_NUMBER'})
    value: number;
  maxValue: number;

  constructor(value?: number, maxValue?: number) {
    this.value = value;
    this.maxValue = maxValue;
  }
}
