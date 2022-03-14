import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_TWO_DECIMAL_NUMBER} from '../validationErrors/errorMessageConstants';
import {MAX_AMOUNT_VALUE} from './validationConstraints';

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
    const numericValue = Number(value);
    return decimalPattern.test(value) && numericValue !==0 && numericValue < MAX_AMOUNT_VALUE ;
  }
  defaultMessage() {
    return VALID_TWO_DECIMAL_NUMBER;
  }

}
