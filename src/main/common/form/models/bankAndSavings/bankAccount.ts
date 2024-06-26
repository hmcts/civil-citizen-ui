import {IsNotEmpty, IsIn, Validate, ValidateIf} from 'class-validator';

import {AccountBalanceValidator} from 'form/validators/accountBalanceValidator';
import {BankAccountTypeValues} from 'form/models/bankAndSavings/bankAccountTypeValues';

export class BankAccount {
  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsIn(Object.values(BankAccountTypeValues).splice(1,4), {message: 'ERRORS.TYPE_OF_ACCOUNT_REQUIRED'})
    typeOfAccount?: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: 'ERRORS.VALID_OPTION_SELECTION'})
    joint?: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: 'ERRORS.NUMBER_REQUIRED'})
  @Validate(AccountBalanceValidator)
    balance?: string;

  constructor(typeOfAccount?: string, joint?: string, balance?: string) {
    this.typeOfAccount = typeOfAccount === BankAccountTypeValues.CHOOSE ?'': typeOfAccount;
    this.joint = joint;
    this.balance = balance;
  }

  public isEmpty (): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value?.length === 0);
  }

  isAtLeastOneFieldPopulated (): boolean {
    return !this.isEmpty();
  }
}
