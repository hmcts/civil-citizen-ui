import {IsNotEmpty, IsIn, Validate, ValidateIf} from 'class-validator';
import {Form} from '../../../form/models/form';
import {
  SELECT_AN_OPTION,
  TYPE_OF_ACCOUNT_REQUIRED,
  NUMBER_REQUIRED,
} from '../../../form/validationErrors/errorMessageConstants';
import {AccountBalanceValidator} from '../../../form/validators/accountBalanceValidator';
import {BankAccountTypeValues} from '../../../form/models/bankAndSavings/bankAccountTypeValues';

export class BankAccount extends Form {

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsIn(Object.values(BankAccountTypeValues), {message: TYPE_OF_ACCOUNT_REQUIRED})
    typeOfAccount?: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: SELECT_AN_OPTION})
    joint?: boolean;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: NUMBER_REQUIRED})
  @Validate(AccountBalanceValidator)
    balance?: string;

  constructor(typeOfAccount?: string, joint?: boolean, balance?: string) {
    super();
    this.typeOfAccount = typeOfAccount;
    this.joint = joint;
    this.balance = balance;
  }

  public isEmpty (): boolean {
    return Object.values(this).every(value => value === undefined || value === '');
  }

  isAtLeastOneFieldPopulated (): boolean {
    return !this.isEmpty();
  }
}
