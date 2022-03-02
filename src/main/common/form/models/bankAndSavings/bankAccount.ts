import {IsDefined, IsIn, ValidateIf} from 'class-validator';
import {BankAccountType} from './bankAccountType';
import {Form} from '../../../form/models/form';
import {
  SELECT_AN_OPTION,
  TYPE_OF_ACCOUNT_REQUIRED,
  NUMBER_REQUIRED,
} from '../../../form/validationErrors/errorMessageConstants';

export class BankAccount extends Form {

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: TYPE_OF_ACCOUNT_REQUIRED})
  @IsIn(BankAccountType.all(), {message: TYPE_OF_ACCOUNT_REQUIRED})
  typeOfAccount?: BankAccountType;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: SELECT_AN_OPTION})
  joint?: boolean;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: NUMBER_REQUIRED})
  balance?: number;

  constructor(typeOfAccount?: BankAccountType, joint?: boolean, balance?: number) {
    super();
    this.typeOfAccount = typeOfAccount;
    this.joint = joint;
    this.balance = balance;
  }
}
