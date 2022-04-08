import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {
  VALID_TWO_DECIMAL_NUMBER,
} from '../validationErrors/errorMessageConstants';
import {MAX_AMOUNT_VALUE} from './validationConstraints';

/**
 * Validator for currency that allows two decimal places
 */
@ValidatorConstraint({name: 'customCurrencyValidator', async: false})
export class CurrencyValidator implements ValidatorConstraintInterface {  numericValue: number;
  correctPlaces: boolean;
  validNumber: boolean;

  validate(value: string): Promise<boolean> | boolean {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    if (value === '0') {
      return false;
    }
    const decimalPattern = /^\d*\.?\d{0,2}$/;
    const noMultipleZeros = /^(?!-0(\.0+)?$)-?(0|[1-9]\d*)(\.\d+)?$/;
    this.numericValue = Number(value);
    this.correctPlaces = decimalPattern.test(value) && this.numericValue < MAX_AMOUNT_VALUE;
    this.validNumber = noMultipleZeros.test(value);
    return this.correctPlaces && this.validNumber;
  }

  defaultMessage() {
    return VALID_TWO_DECIMAL_NUMBER;
  }

}
