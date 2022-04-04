import {ValidateNested, ValidationError, Validator} from 'class-validator';
import {FormValidationError} from '../validationErrors/formValidationError';

const validator = new Validator();

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

  hasNestedErrors(): boolean {
    return this.hasErrors()
      && this.getErrors().some(error => error.children?.length > 0);
  }

  /**
   * Get error message associated with first constraint violated for given field name.
   *
   * @param fieldName - field name / model property
   */
  errorFor(fieldName: string): string {
    if (this.hasFieldError(fieldName)) {
      return this.getErrors()
        .filter((error: FormValidationError) => error.constraints && error.property === fieldName)
        .map((error: FormValidationError) => error.text)[0];
    }
  }

  nestedErrorFor(fieldName: string): string {
    if (this.hasNestedFieldError(fieldName)) {
      return this.getNestedErrors()
        .filter((error: FormValidationError) => error.property === fieldName)
        .map((error: FormValidationError) => error.text)[0];
    }
  }

  public getErrors(): FormValidationError[] {
    const validators: FormValidationError[] = [];
    if (this.hasErrors()) {
      for (const item of this.errors) {
        validators.push(new FormValidationError(item));
      }
    }
    return validators;
  }

  public getAllErrors(): FormValidationError[] {
    return this.getErrors().concat(this.getNestedErrors());
  }

  public getNestedErrors(): FormValidationError[] {
    let validators: FormValidationError[] = [];
    this.getErrors()
      .forEach(error => {
        validators = validators.concat(this.getAllChildrenErrors(error));
      });
    return validators;
  }

  public hasFieldError(field: string): boolean {
    if (this.errors) {
      return this.errors.some((error) => field == error.property);
    }
  }

  public hasNestedFieldError(field: string): boolean {
    if (this.hasNestedErrors()) {
      return this.errors
        .some((error) => error.children
          .some((nestedError) => field == nestedError.property));
    }
  }

  public async validate() {
    this.errors = await validator.validate(this.model as unknown as object);
  }

  private getAllChildrenErrors(error: ValidationError): FormValidationError[] {
    let formErrors: FormValidationError[] = [];
    if (error.children?.length > 0) {
      error.children.forEach(childError => {
        formErrors.push(new FormValidationError(childError));
        if (childError.children?.length > 0) {
          formErrors = formErrors.concat(this.getAllChildrenErrors(childError));
        }
      });
      return formErrors;
    }
  }
}
