import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {
  SELECT_AN_OPTION,
  NUMBER_REQUIRED,
} from '../../../../form/validationErrors/errorMessageConstants';
import {AccountBalanceValidator} from '../../../../../common/form/validators/accountBalanceValidator';
import {Form} from '../../../../../common/form/models/form';

export class DebtItems extends Form{

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: SELECT_AN_OPTION})
    debt: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: SELECT_AN_OPTION})
    totalOwed: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: NUMBER_REQUIRED})
  @Validate(AccountBalanceValidator)
    monthlyPayments: string;


  constructor(debt: string, totalOwed: string, monthlyPayments: string) {
    super();
    this.debt = debt;
    this.totalOwed = totalOwed;
    this.monthlyPayments = monthlyPayments;
  }

  public isEmpty (): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value === []);
  }

  isAtLeastOneFieldPopulated (): boolean {
    return !this.isEmpty();
  }

}
