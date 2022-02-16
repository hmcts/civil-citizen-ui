import {ValidationError} from 'class-validator';
import {HtmlConverter} from '../../utils/htmlFormConverter';

export class FormValidationError extends ValidationError {

  /**
   * Field name associated with validated model property.
   */
  fieldName: string

  /**
   * Message associated with first constraint violated of validated model property.
   */
  message: string

  constructor(error: ValidationError, parentProperty?: string) {
    super();
    Object.assign(this, error);

    this.property = parentProperty ? `${parentProperty}.${this.property}` : this.property;
    this.fieldName = HtmlConverter.asFieldName(this.property);

    const firstConstraintName: string = Object.keys(error.constraints).reverse()[0];
    this.message = error.constraints[firstConstraintName];
  }
}
