import {ClaimAmountRow} from './claimAmountRow';
import {ArrayMinSize, ValidateNested} from 'class-validator';
import {ClaimAmountBreakup} from '../../claimDetails';

const MIN_ROWS = 4;

export class AmountBreakdown {
  @ValidateNested({each: true})
  @ArrayMinSize(1, {message: 'ERRORS.VALID_CLAIM_AMOUNT'})
    claimAmountRows: ClaimAmountRow[];

  constructor(claimAmountRows?: ClaimAmountRow[]) {
    this.claimAmountRows = claimAmountRows;
  }

  public static emptyForm(): AmountBreakdown {
    return new AmountBreakdown([new ClaimAmountRow(), new ClaimAmountRow(), new ClaimAmountRow(), new ClaimAmountRow()]);
  }

  public static fromJsonArray(breakUpJsonArray: ClaimAmountBreakup[]): AmountBreakdown {
    const rows = breakUpJsonArray.map((breakUpJson)=> ClaimAmountRow.fromClaimBreakupJson(breakUpJson));
    if(rows.length > MIN_ROWS) {
      for(let i = 0; i < MIN_ROWS - rows.length; i++){
        rows.push(new ClaimAmountRow());
      }
    }
    return new AmountBreakdown(rows);
  }
}
