import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {
  VALID_TWO_DECIMAL_NUMBER,
} from '../validationErrors/errorMessageConstants';
import {MAX_AMOUNT_VALUE} from './validationConstraints';

/**
 * Validator for currency that allows two decimal places
 */
@ValidatorConstraint({name: 'customCurrencyValidator', async: false})
export class CurrencyValidator implements ValidatorConstraintInterface {
  validNumber: boolean;

  validate(value: string): Promise<boolean> | boolean {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    const decimalPattern = /^(?!0*[.]0*$|[.]0*$|0*$)\d+[.]?\d{0,2}$/;
    this.validNumber = decimalPattern.test(value) && Number(value) < MAX_AMOUNT_VALUE;
    return this.validNumber;
  }

  defaultMessage() {
    return VALID_TWO_DECIMAL_NUMBER;
  }

}
