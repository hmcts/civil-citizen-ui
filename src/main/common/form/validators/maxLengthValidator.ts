import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {ADDRESS_LINE_MAX_LENGTH_JO} from 'form/validators/validationConstraints';

/**
 * Validates the address and city fields inputs max length
 */
@ValidatorConstraint({name: 'maxLengthValidator', async: true})
export class MaxLengthValidator implements ValidatorConstraintInterface {
  errorMessage: string[] = [];

  async validate(text: string, validationArguments?: ValidationArguments) {
    if (!text) {
      return true;
    }
    const textLength = text.trim().length;

    if (validationArguments.property == 'addressLine1' && textLength > ADDRESS_LINE_MAX_LENGTH_JO) {
      this.errorMessage.push('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      return false;
    } else if ((validationArguments.property == 'addressLine2' || validationArguments.property == 'addressLine3')
      && textLength > ADDRESS_LINE_MAX_LENGTH_JO) {
      this.errorMessage.push('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      return false;
    } else if (validationArguments.property == 'city' && textLength > ADDRESS_LINE_MAX_LENGTH_JO) {
      this.errorMessage.push('ERRORS.TOWN_CITY_TOO_MANY_JO');
      return false;
    } else {
      return true;
    }
  }

  defaultMessage() {
    return this.errorMessage.shift();
  }
}
