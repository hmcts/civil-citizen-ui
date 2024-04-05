import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that is over 18 years old
 */
@ValidatorConstraint({name: 'over18Validator', async: false})
export class Over18Validator implements ValidatorConstraintInterface {

  validate(date: Date) {
    const now = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
    const dob = date.getFullYear() * 10000 + (date.getMonth()+1) * 100 + date.getDate() * 1;

    return now - dob >= 180000;
  }

  defaultMessage() {
    return 'ERRORS.VALID_OVER_18_YEARS_OLD';
  }
}
