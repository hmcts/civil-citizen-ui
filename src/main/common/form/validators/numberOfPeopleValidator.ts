import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import { VALID_NUMBER_OF_PEOPLE, NUMBER_OF_PEOPLE_REQUIRED } from '../validationErrors/errorMessageConstants';

@ValidatorConstraint({name: 'customInt', async: false})
export class NumberOfPeopleValidator implements ValidatorConstraintInterface {
  numericValue: number;

  validate(value: number) {
    this.numericValue = value;
    if (value !== undefined && value !== null && value == 0) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return this.numericValue ? VALID_NUMBER_OF_PEOPLE : NUMBER_OF_PEOPLE_REQUIRED;
  }
}
