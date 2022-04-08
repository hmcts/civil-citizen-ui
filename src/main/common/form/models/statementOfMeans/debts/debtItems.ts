import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {
  ENTER_A_DEBT, VALID_NUMBER_OF_PEOPLE,
} from '../../../../form/validationErrors/errorMessageConstants';
import {Form} from '../../../../../common/form/models/form';
import {CurrencyValidator} from '../../../../../common/form/validators/currencyValidator';

export class DebtItems extends Form{

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: ENTER_A_DEBT})
    debt: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: VALID_NUMBER_OF_PEOPLE})
  //@IsCurrency({maxDecimalPlaces: 2}, {message: VALID_TWO_DECIMAL_NUMBER})
  @Validate(CurrencyValidator)
    totalOwned: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: VALID_NUMBER_OF_PEOPLE})
  //@IsCurrency({maxDecimalPlaces: 2}, {message: VALID_TWO_DECIMAL_NUMBER})
  @Validate(CurrencyValidator)
    monthlyPayments: string;


  constructor(debt: string, totalOwned: string, monthlyPayments: string) {
    super();
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
