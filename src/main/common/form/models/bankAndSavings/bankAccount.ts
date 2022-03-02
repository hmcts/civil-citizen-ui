import {IsDefined, IsIn, ValidateIf} from 'class-validator';
import {BankAccountType} from './bankAccountType';
import {Form} from '../../form/models/form';

export class BankAccount extends Form {

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: ValidationErrors.TYPE_OF_ACCOUNT_REQUIRED})
  @IsIn(BankAccountType.all(), {message: ValidationErrors.TYPE_OF_ACCOUNT_REQUIRED})
    typeOfAccount?: BankAccountType;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: GlobalValidationErrors.SELECT_AN_OPTION})
    joint?: boolean;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: GlobalValidationErrors.NUMBER_REQUIRED})
  balance?: number;

  constructor(typeOfAccount?: BankAccountType, joint?: boolean, balance?: number) {
    this.typeOfAccount = typeOfAccount;
    this.joint = joint;
    this.balance = balance;
  }
}
