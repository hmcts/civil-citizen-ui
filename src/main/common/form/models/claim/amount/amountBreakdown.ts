import {ClaimAmountRow} from './claimAmountRow';
import { ValidateNested} from 'class-validator';
import {ClaimAmountBreakup} from '../../claimDetails';
import {AtLeastOneRowIsPopulated} from '../../../validators/atLeastOneRowIsPopulated';
import {MAX_CLAIM_AMOUNT_TOTAL} from '../../../validators/validationConstraints';

const MIN_ROWS = 4;

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

  public isValidTotal() {
    return this.totalAmount <= MAX_CLAIM_AMOUNT_TOTAL;
  }

  public static emptyForm(): AmountBreakdown {
    return new AmountBreakdown([new ClaimAmountRow(), new ClaimAmountRow(), new ClaimAmountRow(), new ClaimAmountRow()]);
  }

  public static fromJsonArray(breakUpJsonArray: ClaimAmountBreakup[]): AmountBreakdown {
    const rows = breakUpJsonArray.map((breakUpJson)=> ClaimAmountRow.fromClaimBreakupJson(breakUpJson));
    if(rows.length < MIN_ROWS) {
      const rowLength = rows.length;
      for(let i = 0; i < (MIN_ROWS - rowLength); i++){
        rows.push(new ClaimAmountRow());
      }
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

  public static fromObject2(value: Record<string, object>) : AmountBreakdown {
    if(!value){
      return undefined;
    }
    const rows = (value.claimAmountRows as Array<Record<string,string>>).map((row)=> ClaimAmountRow.fromObject2(row));
    return new AmountBreakdown(rows, Number(value.totalAmount));
  }
}
