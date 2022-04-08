import {Validator} from 'class-validator';
import {Form} from '../models/form';

const validator = new Validator();
const ERROR_FIELD = 'errors';

export async function validateForm(form: Form) {
  const errors = await validator.validate(form);
  form.errors = errors;
}

export async function validateFormArray(forms: Form[]) {
  if (forms?.length) {
    for (const form of forms) {
      await validateForm(form);
    }
  }
}

export async function validateFormNested(form: any) {
  const errors = await validator.validate(form);
  form.errors = errors;
  if (errors.length) {
    const keys = Object.keys(form);
    for (const key of keys) {
      if (key !== ERROR_FIELD && form[key] instanceof Array){
        for (const element of form[key]) {
          await validateFormNested(element);
        }
      }
    }
  }
}
