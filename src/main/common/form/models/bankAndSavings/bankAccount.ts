import {IsDefined, IsIn, Validate, ValidateIf} from 'class-validator';
import {BankAccountType} from './bankAccountType';
import {Form} from '../../../form/models/form';
import {
  SELECT_AN_OPTION,
  TYPE_OF_ACCOUNT_REQUIRED,
  NUMBER_REQUIRED,
} from '../../../form/validationErrors/errorMessageConstants';
import {AccountBalanceValidator} from '../../../form/validators/accountBalanceValidator';
import { BankAccountTypes } from './bankAccountTypes';

export class BankAccount extends Form {

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: TYPE_OF_ACCOUNT_REQUIRED})
  @IsIn(new BankAccountTypes().required(), {message: TYPE_OF_ACCOUNT_REQUIRED})
    typeOfAccount?: BankAccountType;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: SELECT_AN_OPTION})
    joint?: boolean;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: NUMBER_REQUIRED})
  @Validate(AccountBalanceValidator)
    balance?: string;

  constructor(typeOfAccount?: BankAccountType, joint?: boolean, balance?: string) {
    super();
    this.typeOfAccount = typeOfAccount;
    this.joint = joint;
    this.balance = balance;
  }

  public isEmpty (): boolean {
    return Object.values(this).every(value => (value === undefined || value === ''));
  }

  isAtLeastOneFieldPopulated (): boolean {
    return !this.isEmpty();
  }
}
