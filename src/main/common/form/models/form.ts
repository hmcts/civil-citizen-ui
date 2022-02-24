import {ValidationError} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';

export class Form {
  errors?: ValidationError[];

  constructor(errors?: ValidationError[]) {
    this.errors = errors;
  }

  hasErrors(): boolean {
    return this.errors !== undefined;
  }

  public getErrors(): FormValidationError[] {
    if (this.hasErrors()) {
      const validators: FormValidationError[] = [];
      for (const item of this.errors) {
        validators.push(new FormValidationError(item));
      }
      return validators;
    }
  }

  public hasFieldError(field: string) : boolean{
    if (this.errors){
      return this.errors.some((error) => field == error.property);
    }
  }

  public getTextError(errors: ValidationError[], property: string) {
    let error;
    errors.filter((item) => {
      if (item.property == property) {
        error = item.constraints.isNotEmpty
      }
    });
    return error;
  }
}
