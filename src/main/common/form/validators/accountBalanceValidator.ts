import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_TWO_DECIMAL_NUMBER} from '../validationErrors/errorMessageConstants';

/**
 * Validator for account balance that allows two decimal places and negative values
 */
@ValidatorConstraint({name: 'customAccountBalanceValidator', async: false})
export class AccountBalanceValidator implements ValidatorConstraintInterface {
  validate(value: string): Promise<boolean> | boolean {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    const decimalPattern = /^-?\d*\.?\d{0,2}$/;
    return decimalPattern.test(value);
  }
  defaultMessage() {
    return VALID_TWO_DECIMAL_NUMBER;
  }

}
