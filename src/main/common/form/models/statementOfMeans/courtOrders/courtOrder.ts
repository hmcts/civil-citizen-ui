import {IsDefined, IsNotEmpty, IsNumber, Min, ValidateIf} from 'class-validator';
import {
  VALID_AMOUNT,
  VALID_AMOUNT_ONE_POUND_OR_MORE,
  VALID_CLAIM_NUMBER,
  VALID_STRICTLY_POSITIVE_NUMBER,
  VALID_TWO_DECIMAL_NUMBER,
} from '../../../../../common/form/validationErrors/errorMessageConstants';
import {toNumberOrUndefined} from '../../../../../common/utils/numberConverter';

export class CourtOrder {

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: VALID_AMOUNT})
  @IsNumber({maxDecimalPlaces: 2}, {message: VALID_TWO_DECIMAL_NUMBER})
  @Min(0, {message: VALID_STRICTLY_POSITIVE_NUMBER})
    instalmentAmount?: number;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: VALID_AMOUNT})
  @IsNumber({maxDecimalPlaces: 2}, {message: VALID_TWO_DECIMAL_NUMBER})
  @Min(1.00, {message: VALID_AMOUNT_ONE_POUND_OR_MORE})
    amount?: number;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({message: VALID_CLAIM_NUMBER})
    claimNumber?: string;

  constructor(amount?: number, instalmentAmount?: number, claimNumber?: string) {
    this.instalmentAmount = instalmentAmount;
    this.amount = amount;
    this.claimNumber = claimNumber;
  }

  static fromObject(value?: any): CourtOrder {
    if (!value) {
      return value;
    }

    const instalmentAmount: number = toNumberOrUndefined(value.instalmentAmount);
    const amount: number = toNumberOrUndefined(value.amount);
    const claimNumber: string = value.claimNumber || undefined;

    return new CourtOrder(amount, instalmentAmount, claimNumber);
  }

  public isEmpty (): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value === []);
  }

  isAtLeastOneFieldPopulated (): boolean {
    return !this.isEmpty();
  }
}
