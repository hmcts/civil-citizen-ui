import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

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
    return this.numericValue ? 'ERRORS.VALID_STRICTLY_POSITIVE_NUMBER' : 'ERRORS.NUMBER_OF_PEOPLE_REQUIRED';
  }
}
