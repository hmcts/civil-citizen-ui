import {ValidateNested, ValidationError} from 'class-validator';
import * as _ from 'lodash';
import {FormValidationError} from './validationErrors/formValidationError';

/**
 * Represents a form that the user needs to fill in.
 * Contains validation errors on fields of the model.
 * Model contains fields that the user needs to fill in.
 */
export class Form<Model> {

  @ValidateNested()
  model: Model
  rawData: object
  errors: FormValidationError[]

  /**
   * @param model - a object used to fill the form
   * @param errors - an array of error objects
   * @param rawData - a raw data used to create model instance
   */
  constructor(model: Model, errors: ValidationError[] = [], rawData: object = undefined) {
    this.model = model;
    this.rawData = rawData;
    this.errors = this.flatMapDeep(errors);
  }

  static empty<Model>(): Form<Model> {
    return new Form<Model>(undefined, []);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Get error message associated with first constraint violated for given field name.
   *
   * @param fieldName - field name / model property
   */
  errorFor(fieldName: string): string {
    return this.errors
      .filter((error: FormValidationError) => error.fieldName === fieldName)
      .map((error: FormValidationError) => error.message)[0];
  }


  /**
   * Maps array of ValidationError returned by validation framework to FormValidationErrors containing extra form related properties.
   *
   * It also flattens nested structure of ValidationError (see: children property) into flat, one dimension array.
   *
   * @param errors - list of errors
   * @param parentProperty - parent property name
   */
  private flatMapDeep(errors: ValidationError[], parentProperty?: string): FormValidationError[] {
    return _.flattenDeep<FormValidationError>(
      errors.map((error: ValidationError) => {
        if (error.children && error.children.length > 0) {
          return this.flatMapDeep(error.children, parentProperty ? `${parentProperty}.${error.property}` : error.property);
        } else {
          return new FormValidationError(error, parentProperty);
        }
      }),
    );
  }
}
