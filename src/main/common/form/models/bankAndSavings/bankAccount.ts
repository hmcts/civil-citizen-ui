import {IsNotEmpty, IsIn, Validate, ValidateIf} from 'class-validator';
import {Form} from '../../../form/models/form';
import {AccountBalanceValidator} from '../../../form/validators/accountBalanceValidator';
import {BankAccountTypeValues} from '../../../form/models/bankAndSavings/bankAccountTypeValues';

export class BankAccount extends Form {

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsIn(Object.values(BankAccountTypeValues), {message: 'ERRORS.TYPE_OF_ACCOUNT_REQUIRED'})
    typeOfAccount?: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: 'ERRORS.VALID_OPTION_SELECTION'})
    joint?: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: 'ERRORS.NUMBER_REQUIRED'})
  @Validate(AccountBalanceValidator)
    balance?: string;

  constructor(typeOfAccount?: string, joint?: string, balance?: string) {
    super();
    this.typeOfAccount = typeOfAccount;
    this.joint = joint;
    this.balance = balance;
  }

  public isEmpty (): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value === []);
  }

  isAtLeastOneFieldPopulated (): boolean {
    return !this.isEmpty();
  }
}
