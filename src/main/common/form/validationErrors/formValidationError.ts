import {ValidationError} from 'class-validator';
import {HtmlConverter} from '../../utils/htmlFormConverter';
import {FileUpload} from "models/caseProgression/uploadDocumentsUserForm";

export class FormValidationError extends ValidationError {

  /**
   * Field name associated with validated model property.
   */
  fieldName: string;

  /**
   * Message associated with first constraint violated of validated model property.
   */
  text: string;
  href: string;

  constructor(error: ValidationError, parentProperty?: string) {
    super();
    console.log('parentProperty ==>' + parentProperty);
    console.log('error ==>' + error);

    if (error.target instanceof FileUpload){
      console.log('instanceof FileUpload ==>');
      //this.property = error.target.fieldname;

    }else {
      this.property = parentProperty ? `${parentProperty}[${this.property}]` : this.property;

    }
    Object.assign(this, error);
    this.property = parentProperty ? `${parentProperty}[${this.property}]` : this.property;

    this.fieldName = HtmlConverter.asFieldName(this.property);
    console.log('fieldName ===> ' + this.fieldName);console.log('property ===> ' + this.property);
    const constraintMessages: string[] = error.constraints ? Object.values(error.constraints) : undefined;
    this.text = constraintMessages ? constraintMessages[0] : '';
    this.href = `#${this.property}`;
  }
}
