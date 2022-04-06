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
  errorFor(fieldName: string, parentProperty?: string): string {
    if (this.hasFieldError(fieldName, parentProperty)) {
      return this.getAllErrors(parentProperty)
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

  public getErrors(property?: string): FormValidationError[] {
    const validators: FormValidationError[] = [];
    if (this.hasErrors()) {
      for (const item of this.errors) {
        validators.push(new FormValidationError(item, property));
      }
    }
    return validators;
  }

  public getAllErrors(property?: string): FormValidationError[] {
    const nestedErrors = this.getNestedErrors(property).filter(error => error !== undefined);
    return nestedErrors && nestedErrors.length > 0 ? this.getErrors(property).concat(nestedErrors) : this.getErrors(property);
  }

  public getNestedErrors(property?: string): FormValidationError[] {
    let validators: FormValidationError[] = [];
    this.getErrors()
      .forEach(error => {
        const childErrors = this.getAllChildrenErrors(error, property);
        if (childErrors) {
          validators = validators.concat(childErrors);
        }
      });
    return validators;
  }

  public hasFieldError(field: string, parentProperty?: string): boolean {
    return this.getAllErrors(parentProperty)?.some((error) => field == error?.property);
  }

  public hasNestedFieldError(field: string): boolean {
    return this.getNestedErrors()?.some((error) => field == error.property);
  }

  public async validate() {
    this.errors = await validator.validate(this.model as unknown as object);
  }

  private getAllChildrenErrors(error: ValidationError, parentProperty?: string): FormValidationError[] {
    let formErrors: FormValidationError[] = [];
    if (error.children?.length > 0) {
      error.children.forEach(childError => {
        const errorProperty = parentProperty ? `${parentProperty}[${error.property}]` : error.property;
        formErrors.push(new FormValidationError(childError, errorProperty));
        if (childError.children?.length > 0) {
          formErrors = formErrors.concat(this.getAllChildrenErrors(childError, errorProperty));
        }
      });
      return formErrors;
    }
  }
}
