
export class Form {
  constructor(private readonly fields: FormFields) {}

  /**
   * Pass the form body to any fields with a validator and return a list of errors
   */

  public getFieldNames(): Set<string> {
    const fields = this.fields;
    const fieldNames: Set<string> = new Set();
    for (const fieldKey in fields) {
      const stepField = fields[fieldKey] as FormOptions;
      if (stepField.values && stepField.type !== 'date') {
        for (const [, value] of Object.entries(stepField.values)) {
          if (value.name) {
            fieldNames.add(value.name);
          } else {
            fieldNames.add(fieldKey);
          }
          if (value.subFields) {
            for (const field of Object.keys(value.subFields)) {
              fieldNames.add(field);
            }
          }
        }
      } else {
        fieldNames.add(fieldKey);
      }
    }

    return fieldNames;
  }
}

type LanguageLookup = (lang: Record<string, never>) => string;

type Parser = (value: Record<string, unknown> | string[]) => void;

type Label = string | LanguageLookup;

type Warning = Label;

export type ValidationCheck = (

) => void | string;
export type FormFields = Record<string, FormField>;


export interface FormContent {
  submit: {
    text: Label;
    classes?: string;
  };
  fields: FormFields;
}

export type FormField = FormInput | FormOptions;

export interface FormOptions {
  id?: string;
  type: string;
  label?: Label;
  labelHidden?: boolean;
  labelSize?: string | null;
  hideError?: boolean;
  values: FormInput[];
  attributes?: Partial<HTMLInputElement | HTMLTextAreaElement>;
  validator?: ValidationCheck;
  parser?: Parser;
}

export interface FormInput {
  id?: string;
  name?: string;
  label: Label;
  hint?: Label;
  subtext?: Label;
  classes?: string;
  hidden?: boolean;
  selected?: boolean;
  value?: string | number;
  attributes?: Partial<HTMLInputElement | HTMLTextAreaElement>;
  validator?: ValidationCheck;
  parser?: Parser;
  warning?: Warning;
  conditionalText?: Label;
  subFields?: Record<string, FormField>;
}

export interface CsrfField {
  _csrf: string;
}

export type FormError = {
  propertyName: string;
  errorType: string;
};
