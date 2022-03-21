import {ValidateNested, ValidationError} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';

export class GenericForm<Model> {
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

  /**
   * Get error message associated with first constraint violated for given field name.
   *
   * @param fieldName - field name / model property
   */
  errorFor(fieldName: string): string {
    if (this.hasFieldError(fieldName)) {
      return this.getErrors()
        .filter((error: FormValidationError) => error.property === fieldName)
        .map((error: FormValidationError) => error.text)[0];
    }
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
}
