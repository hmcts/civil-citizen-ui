import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {
  NUMBER_OF_PEOPLE_REQUIRED,
  VALID_STRICTLY_POSITIVE_NUMBER,
} from '../validationErrors/errorMessageConstants';

@ValidatorConstraint({name: 'customZeroOrMinOnePerson', async: false})
export class NumberOfPeopleValidator implements ValidatorConstraintInterface {
  numericValue: number;

  validate(value: number) {
    this.numericValue = value;
    if (!value || value == 0) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return this.numericValue ? VALID_STRICTLY_POSITIVE_NUMBER : NUMBER_OF_PEOPLE_REQUIRED;
  }
}
