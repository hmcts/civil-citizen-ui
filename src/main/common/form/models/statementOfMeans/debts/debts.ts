import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {
  ENTER_AT_LEAST_ONE_DEBT,
  VALID_YES_NO_OPTION,
} from '../../../../../common/form/validationErrors/errorMessageConstants';
import {DebtItems} from '../../../../../common/form/models/statementOfMeans/debts/debtItems';
import {YesNo} from '../../../../../common/form/models/yesNo';
import {Form} from '../../../../../common/form/models/form';
import {AtLeastOnePopulatedRow} from '../../../../../common/form/validators/atLeastOnePopulatedRow';

export const INIT_ROW_COUNT = 2;

export class Debts extends Form {
  @IsDefined({message: VALID_YES_NO_OPTION})
    option?: string;

  @ValidateIf((o: Debts) => o.option === YesNo.YES)
  @AtLeastOnePopulatedRow({message: ENTER_AT_LEAST_ONE_DEBT})
  @ValidateNested({ each: true })
    debtsItems?: DebtItems[] ;

  constructor(option?: string, debtsItems?: DebtItems[]) {
    super();
    this.option = option;
    this.debtsItems = debtsItems || this.getInitialRows();
  }

  getInitialRows() : DebtItems[]{
    const items: DebtItems[] = [];
    for (let i = 0; i < INIT_ROW_COUNT; i++) {
      items.push(new DebtItems('','', ''));
    }
    return items;
  }

}
