import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';

import {CurrencyValidator} from '../../../../../common/form/validators/currencyValidator';

export class DebtItems{

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: 'ERRORS.ENTER_A_DEBT'})
    debt: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: 'ERRORS.VALID_STRICTLY_POSITIVE_NUMBER'})
  @Validate(CurrencyValidator)
    totalOwned: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: 'ERRORS.VALID_STRICTLY_POSITIVE_NUMBER'})
  @Validate(CurrencyValidator)
    monthlyPayments: string;

  constructor(debt: string, totalOwned: string, monthlyPayments: string) {
    this.debt = debt;
    this.totalOwned = totalOwned;
    this.monthlyPayments = monthlyPayments;
  }

  public isEmpty (): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value === []);
  }

  isAtLeastOneFieldPopulated (): boolean {
    return !this.isEmpty();
  }

}
