import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'customIsCheckedArrayValidator', async: false})
export class IsCheckedArrayValidator implements ValidatorConstraintInterface {

  validate(value: any[] ) {
    return value.some(item=>item.checked);
  }

  defaultMessage() {
    return 'ERRORS.SELECT_SUPPORT';
  }
}
