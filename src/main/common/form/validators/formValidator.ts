import {Validator} from 'class-validator';
import {Form} from '../models/form';

const validator = new Validator();

export async function validateForm(form: Form) {
  const errors = await validator.validate(form);
  form.errors = errors;
}

export async function validateFormArray(forms: Form[]) {
  if (forms?.length > 0) {
    for (const form of forms) {
      await validateForm(form);
    }
  }
}
