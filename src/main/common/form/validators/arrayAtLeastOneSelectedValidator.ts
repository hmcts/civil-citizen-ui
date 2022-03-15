import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'customArrayAtLeastOneSelectedValidator', async: false})
export class ArrayAtLeastOneSelectedValidator implements  ValidatorConstraintInterface {

  validate(array: (any)[]): Promise<boolean> | boolean {
    if(array && array.length> 0 ){
      const emptyElementArray = array.filter(element=> this.isElementEmpty(element));
      return emptyElementArray.length !== array.length;
    }
    return false;
  }

  isElementEmpty(element : any){
    return Object.values(element).every(value => value === undefined || value === '');
  }

}
