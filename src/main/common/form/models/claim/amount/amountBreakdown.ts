import {ClaimAmountRow} from './claimAmountRow';
import { ValidateNested} from 'class-validator';
import {ClaimAmountBreakup} from '../../claimDetails';
import {AtLeastOneRowIsPopulated} from '../../../validators/atLeastOneRowIsPopulated';
import {MAX_CLAIM_AMOUNT_TOTAL} from '../../../validators/validationConstraints';

const MIN_ROWS = 2;

export class AmountBreakdown {

  @ValidateNested()
  @AtLeastOneRowIsPopulated( {message: 'ERRORS.VALID_CLAIM_AMOUNT'})
    claimAmountRows: ClaimAmountRow[];
  totalAmount: number;

  constructor(claimAmountRows?: ClaimAmountRow[], totalAmount?: number) {
    this.claimAmountRows = claimAmountRows;
    this.totalAmount = totalAmount;
  }

  public getPopulatedRows() : ClaimAmountRow[] {
    const populatedRows = this.claimAmountRows.filter(row => !row.isEmpty());
    return populatedRows;
  }

  public isValidTotal(mintiEnabled= false) {
    if (mintiEnabled) {
      return true;
    }
    return this.totalAmount <= MAX_CLAIM_AMOUNT_TOTAL;
  }

  public static emptyForm(): AmountBreakdown {
    return AmountBreakdown.fromJsonArray([]);
  }

  public static fromJsonArray(breakUpJsonArray: ClaimAmountBreakup[]): AmountBreakdown {
    const rows = breakUpJsonArray.map((breakUpJson)=> ClaimAmountRow.fromClaimBreakupJson(breakUpJson));
    while (rows.length < MIN_ROWS) {
      rows.push(new ClaimAmountRow());
    }
    return new AmountBreakdown(rows);
  }

  public static fromObject(value: Record<string, object>) : AmountBreakdown {
    if(!value){
      return undefined;
    }
    const rows = (value.claimAmountRows as Array<Record<string,string>>).map((row)=> ClaimAmountRow.fromObject(row));
    return new AmountBreakdown(rows, Number(value.totalAmount));
  }
}
