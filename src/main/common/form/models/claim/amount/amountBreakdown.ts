import {ClaimAmountRow} from './claimAmountRow';
import {ArrayMinSize, ValidateNested} from 'class-validator';

export class AmountBreakdown {
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'ERRORS.VALID_CLAIM_AMOUNT' })
    claimAmountRows: ClaimAmountRow[];
}
