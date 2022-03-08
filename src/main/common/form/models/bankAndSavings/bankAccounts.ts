import { Form } from '../form';
import {BankAccount} from './bankAccount';
import {Validate, ValidateNested} from 'class-validator';
import {SELECT_AN_OPTION} from '../../../form/validationErrors/errorMessageConstants';
import {ArrayAtLeastOneSelectedValidator} from '../../../form/validators/arrayAtLeastOneSelectedValidator';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';

export class BankAccounts extends Form{

  @ValidateNested()
  @Validate( ArrayAtLeastOneSelectedValidator,{message: SELECT_AN_OPTION})
    accounts:BankAccount[];

  constructor(accounts : BankAccount[]) {
    super();
    this.accounts = accounts;
  }

  public getFormErrors(): FormValidationError[]{
    let formErrors = super.getErrors();
    if(this.accounts.length > 0 && this.hasErrors()) {
      for(const account of this.accounts){
        formErrors = formErrors.concat(account.getErrors());
      }
    }
    console.log(formErrors);
    return formErrors;
  }
}
