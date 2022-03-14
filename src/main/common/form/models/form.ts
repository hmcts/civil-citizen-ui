import {ValidateNested, ValidationError} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';

export class Form<Model> {
  @ValidateNested()
    model: Model;
  errors?: ValidationError[];

  constructor(model: Model, errors?: ValidationError[]) {
    this.model = model;
    this.errors = errors;
  }

  hasErrors(): boolean {
    return this.errors?.length > 0;
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

  public hasFieldError(field: string): boolean {
    if (this.errors) {
      return this.errors.some((error) => field == error.property);
    }
  }

  public getTextError(errors: ValidationError[], property: string) {
    const error = errors.filter((item) => item.property == property);
    if (error.length > 0) {
      return error[0].constraints.isNotEmpty || error[0].constraints.customInt ? error[0].constraints.isNotEmpty || error[0].constraints.customInt : '';
    }
  }
}
