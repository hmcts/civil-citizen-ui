import {ValidationError} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';

/**
 * @deprecated This can potentially be deprecated and we may end up using GenericForm instead
 */
export class Form {
  errors?: ValidationError[];

  constructor(errors?: ValidationError[]) {
    this.errors = errors;
  }

  hasErrors(): boolean {
    return this.errors !== undefined && this.errors.length > 0;
  }

  hasChildren(item : ValidationError): boolean{
    return item?.children.length > 0;
  }

  getNestedErrors(item : ValidationError, validators: FormValidationError[]): void {
    item.children
      .forEach(error => error.children
        .forEach(childError => validators.push(new FormValidationError(childError, `${item.property}[${error.property}]`))));
    //return validators;
  }
  public getErrors(parentProperty?: string ): FormValidationError[] {
    if (this.hasErrors()) {
      const validators: FormValidationError[] = [];
      for (const item of this.errors) {
        if(this.hasChildren(item)){
          this.getNestedErrors(item, validators);
        }else{
          validators.push(new FormValidationError(item, parentProperty));
        }
      }
      return validators;
    }
  }

  public hasFieldError(field: string): boolean {
    if (this.errors) {
      return this.errors.some((error) => field == error.property);
    }
  }

  /**
   * Get error message associated with first constraint violated for given field name.
   *
   * @param fieldName - field name / model property
   */
  errorFor(fieldName: string): string {
    return this.getErrors()
      .filter((error: FormValidationError) => error.fieldName === fieldName)
      .map((error: FormValidationError) => error.text)[0];
  }

  public getTextError(errors: ValidationError[], property: string) {
    const error = errors?.filter((item) => item.property == property);
    if (error?.length > 0) {
      return error[0].constraints;
    }
  }
}
