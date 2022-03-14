import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {NUMBER_REQUIRED, VALID_TWO_DECIMAL_NUMBER} from '../validationErrors/errorMessageConstants';
import {MAX_AMOUNT_VALUE} from './validationConstraints';

/**
 * Validator for account balance that allows two decimal places and negative values
 */
@ValidatorConstraint({name: 'customAccountBalanceValidator', async: false})
export class AccountBalanceValidator implements ValidatorConstraintInterface {
  numericValue: number;
  validate(value: string): Promise<boolean> | boolean {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    const decimalPattern = /^-?\d*\.?\d{0,2}$/;
    this.numericValue = Number(value);
    return decimalPattern.test(value) && this.numericValue !==0 && this.numericValue < MAX_AMOUNT_VALUE ;
  }
  defaultMessage() {
    return this.numericValue ===0? NUMBER_REQUIRED : VALID_TWO_DECIMAL_NUMBER;
  }

}
