import { IsNotEmpty, IsNumber, Min, ValidateIf } from 'class-validator';
import { toNumberOrUndefined } from 'common/utils/numberConverter';

export class CourtOrder {
  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER' })
  @Min(0, { message: 'ERRORS.VALID_STRICTLY_POSITIVE_NUMBER' })
    instalmentAmount?: number;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER' })
  @Min(1.00, { message: 'ERRORS.AMOUNT_REQUIRED' })
    amount?: number;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsNotEmpty({ message: 'ERRORS.VALID_CLAIM_NUMBER' })
    claimNumber?: string;

  constructor(amount?: number, instalmentAmount?: number, claimNumber?: string) {
    this.instalmentAmount = instalmentAmount;
    this.amount = amount;
    this.claimNumber = claimNumber;
  }

  static fromObject(value?: Record<string, string>): CourtOrder {
    const instalmentAmount: number = toNumberOrUndefined(value.instalmentAmount);
    const amount: number = toNumberOrUndefined(value.amount);
    const claimNumber: string = value.claimNumber.trim() || undefined;

    return new CourtOrder(amount, instalmentAmount, claimNumber);
  }

  public isEmpty(): boolean {
    return Object.values(this).every(value =>
      value === undefined ||
      value === '' ||
      (typeof value === 'string' && value.trim().length === 0),
    );
  }

  isAtLeastOneFieldPopulated(): boolean {
    return !this.isEmpty();
  }
}
