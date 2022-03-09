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
    if(this.hasAccounts() && this.hasErrors()) {
      this.accounts.forEach((account, i) => {
        formErrors = formErrors.concat(account.getErrors('accounts['+ i +']'));
      });
    }
    return formErrors;
  }

  public removeEmptyAccounts(){
    if(this.hasAccounts()){
      this.accounts = this.accounts.filter(account => account.isAtLeastOneFieldPopulated());
    }
  }

  private hasAccounts(){
    return this.accounts && this.accounts.length > 0
  }
}
