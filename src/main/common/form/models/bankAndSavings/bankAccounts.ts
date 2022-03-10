import { Form } from '../form';
import {BankAccount} from './bankAccount';
import {Validate, ValidateNested} from 'class-validator';
import {SELECT_AN_OPTION} from '../../../form/validationErrors/errorMessageConstants';
import {ArrayAtLeastOneSelectedValidator} from '../../../form/validators/arrayAtLeastOneSelectedValidator';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';

const MINIMUM_ROWS = 2;
export class BankAccounts extends Form{

  @ValidateNested()
  @Validate( ArrayAtLeastOneSelectedValidator,{message: SELECT_AN_OPTION})
    accounts:BankAccount[];

  constructor(accounts : BankAccount[]) {
    super();
    this.accounts = accounts;
    this.addEmptyRowsIfNotEnough();
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

  public getOnlyCompletedAccounts(): BankAccount[]{
    if(this.hasAccounts()){
      return this.accounts.filter(account => account.typeOfAccount !=='' && account.joint !== undefined && account.balance!== undefined );
    }
  }

  private hasAccounts(){
    return this.accounts && this.accounts.length > 0;
  }

  private addEmptyRowsIfNotEnough(){
    if(this.accounts.length > MINIMUM_ROWS){
      for(let i = 0; i < MINIMUM_ROWS - this.accounts.length; i++){
        this.accounts.push(new BankAccount());
      }
    }
  }
}
