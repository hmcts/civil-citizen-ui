import { Form } from '../form';
import {BankAccount} from './bankAccount';
import {Validate, ValidateNested} from 'class-validator';
import {SELECT_AN_OPTION} from '../../../form/validationErrors/errorMessageConstants';
import {ArrayAtLeastOneSelectedValidator} from '../../../form/validators/arrayAtLeastOneSelectedValidator';

export class BankAccounts extends Form{

  @ValidateNested()
  @Validate( ArrayAtLeastOneSelectedValidator,{message: SELECT_AN_OPTION})
    accounts:BankAccount[];

  constructor(accounts : BankAccount[]) {
    super();
    this.accounts = accounts;
  }
}
