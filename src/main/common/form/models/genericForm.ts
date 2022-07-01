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
   * @param parentProperty - optional parameter, parent property if exists to specify the path to the field
   */
  errorFor(fieldName: string, parentProperty?: string): string {
    if (this.hasFieldError(fieldName, parentProperty)) {
      return this.getAllErrors(parentProperty)
        .filter((error: FormValidationError) => error.constraints && error.property === fieldName)
        .map((error: FormValidationError) => error.text)[0];
    }
  }

  /**
   * @deprecated use errorFor instead. It should include all errors
   */
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

  /**
   * Gets parent and child errors in one array
   * @param property - optional parameter (parent field name) to define the path to field errors
   */
  public getAllErrors(property?: string): FormValidationError[] {
    const nestedErrors = this.getNestedErrors(property).filter(error => error !== undefined);
    return nestedErrors?.length > 0 ? this.getErrors(property).concat(nestedErrors) : this.getErrors(property);
  }

  /**
   * Gets all child errors
   * @param property - optional parameter. usually a parent error property to define the path to the field with error
   */
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

  public validateSync() {
    this.errors = validator.validateSync(this.model as unknown as object);
  }

  /**
   * Gets parent and child errors in one array
   * @param property - optional parameter (parent field name) to define the path to field errors
   */
  public getAllStringErrors(property?: string): string[] {
    //const nestedErrors = this.getNestedErrors(property).filter(error => error !== undefined);
    //const list = nestedErrors?.length > 0 ? this.getErrors(property).concat(nestedErrors) : this.getErrors(property);
    const errors: string[] = [];
    errors.push('ERRORS.VALID_INTEGER');
    errors.push('ERRORS.DETAILS_REQUIRED');
    errors.push('ERRORS.SELECT_AN_OPTION');
    return errors;
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
