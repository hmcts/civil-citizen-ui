import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that the input value is either empty or an integer with no special characters
 */
@ValidatorConstraint({name: 'customDate', async: false})
export class OptionalDateValidator implements ValidatorConstraintInterface {

  validate(date:Date) {
    const iMonth:number[] =[1,3,5,7,8,10,12];
    const pMonth:number[] =[4,6,9,11,8];
    const sMonth = 2;
    console.log('1: ' + (date.getMonth() in pMonth && date.getDate()<31));
    console.log('1: ' + (date.getMonth()  == sMonth && date.getDate()<30));
    console.log('1: ' + (date.getMonth()  in iMonth && date.getDate()<32));
    console.log('1: ' + date.getMonth() in pMonth);
    console.log('1: ' + (date.getMonth() in pMonth));
    if (((date.getMonth() in pMonth) && date.getDate()<31) || ((date.getMonth()  == sMonth) && date.getDate()<30) || ((date.getMonth()  in iMonth) && date.getDate()<32)) {
      return true;
    }
    return true;
  }

  defaultMessage() {
    return 'There was a problem. Please enter numeric number';
  }

}
