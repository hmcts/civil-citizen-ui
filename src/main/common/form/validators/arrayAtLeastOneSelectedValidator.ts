import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'customArrayAtLeastOneSelectedValidator', async: false})
export class ArrayAtLeastOneSelectedValidator implements  ValidatorConstraintInterface {

  validate(array: (unknown)[]): Promise<boolean> | boolean {
    if(array?.length> 0 ){
      const emptyElementArray = array.filter(element=> this.isElementEmpty(element));
      return emptyElementArray.length !== array.length;
    }
    return false;
  }

  isElementEmpty(element : unknown){
    return Object.values(element).every(value => value === undefined || value === '');
  }

}
