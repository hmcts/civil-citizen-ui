import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'customZeroOrMinOnePerson', async: false})
export class NumberOfPeopleValidator implements ValidatorConstraintInterface {
  numericValue: number;

  validate(value: number) {
    this.numericValue = value;
    return !(!value || value <= 0);
  }

  defaultMessage() {
    return this.numericValue ? 'ERRORS.VALID_STRICTLY_POSITIVE_NUMBER' : 'ERRORS.NUMBER_OF_PEOPLE_REQUIRED';
  }
}
