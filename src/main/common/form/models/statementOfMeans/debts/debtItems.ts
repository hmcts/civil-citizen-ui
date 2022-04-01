import {IsNotEmpty,  Validate, ValidateIf} from 'class-validator';
import {
  SELECT_AN_OPTION,
  NUMBER_REQUIRED, ENTER_AT_LEAST_ONE_ROW,
} from '../../../../form/validationErrors/errorMessageConstants';
import {AccountBalanceValidator} from '../../../../form/validators/accountBalanceValidator';
import {AtLeastOnePopulatedRow} from '../../../../../common/form/validators/atLeastOnePopulatedRow';

export class DebtItems {

  @ValidateIf(o => o.AtLeastOnePopulatedRow())
    loanCreditCar: string;

  @ValidateIf(o => o.AtLeastOnePopulatedRow())
  @IsNotEmpty({message: SELECT_AN_OPTION})
    totalOwed: string;

  @AtLeastOnePopulatedRow({message: ENTER_AT_LEAST_ONE_ROW})
  @IsNotEmpty({message: NUMBER_REQUIRED})
  @Validate(AccountBalanceValidator)
    monthlyPayments: string;


  constructor(loanCreditCar: string, totalOwed: string, monthlyPayments: string) {
    this.loanCreditCar = loanCreditCar;
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
