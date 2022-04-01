import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {VALID_YES_NO_OPTION} from 'common/form/validationErrors/errorMessageConstants';
import {DebtItems} from 'common/form/models/statementOfMeans/debts/debtItems';

export class Debts {
  @IsDefined({message: VALID_YES_NO_OPTION})
    declared: boolean;

  @ValidateIf((o: Debts) => o.declared === true)
  @ValidateNested()
    debtsItems?: DebtItems[];


  constructor(declared: boolean, debtsItems?: DebtItems[]) {
    this.declared = declared;
    this.debtsItems = debtsItems;
  }
}
