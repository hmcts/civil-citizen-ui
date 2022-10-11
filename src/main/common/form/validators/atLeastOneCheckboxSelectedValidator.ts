import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'customAtLeastOneCheckboxSelectedValidator', async: false})
export class AtLeastOneCheckboxSelectedValidator implements ValidatorConstraintInterface {

  validate(value: boolean[] ) {
    return value.some(item=>item);
  }

  defaultMessage() {
    return 'ERRORS.SELECT_SUPPORT';
  }
}
