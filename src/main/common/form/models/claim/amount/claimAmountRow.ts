import {IsDefined, IsNotEmpty, IsNumber, MaxLength, Min, ValidateIf} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from '../../../validators/validationConstraints';
import {ClaimAmountBreakup} from '../../claimDetails';
import {toNumberOrUndefined} from '../../../../utils/numberConverter';

export class ClaimAmountRow {

  @ValidateIf(o => o.isAtLeastOneFieldPopulated() )
  @IsDefined({message: 'ERRORS.VALID_REASON_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.VALID_REASON_REQUIRED'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_MANY'})
    reason?: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated() )
  @IsDefined({ message: 'ERRORS.AMOUNT_REQUIRED' })
  @Min(0.01, { message: 'ERRORS.VALID_VALUE'})
  @IsNumber(  {allowNaN: false, maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
    amount?: number;

  constructor (reason?: string, amount?: number) {
    this.reason = reason;
    this.amount = amount;
  }

  public isEmpty (): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value?.length === 0 || value === 0);
  }

  isAtLeastOneFieldPopulated (): boolean {
    return !this.isEmpty();
  }

  public static fromClaimBreakupJson( breakUpJson: ClaimAmountBreakup): ClaimAmountRow{
    return new ClaimAmountRow(breakUpJson.value.claimReason, toNumberOrUndefined(breakUpJson.value.claimAmount));
  }

  public static fromObject(value: Record<string, string>): ClaimAmountRow {
    if(!value){
      return undefined;
    }
    return new ClaimAmountRow(value.reason, value.amount? Number(value.amount) : undefined);
  }

}
