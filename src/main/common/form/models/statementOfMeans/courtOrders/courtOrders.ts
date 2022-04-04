import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {boolean, isBooleanable} from 'boolean';
import {CourtOrder} from './courtOrder';
import {
  VALID_ENTER_AT_LEAST_ONE_COURT_ORDER,
  VALID_YES_NO_SELECTION,
} from '../../../../../common/form/validationErrors/errorMessageConstants';
import {AtLeastOneRowIsPopulated} from '../../../../../common/form/validators/atLeastOneRowIsPopulated';

export class CourtOrders {

  @IsDefined({message: VALID_YES_NO_SELECTION})
    declared: boolean;

  @ValidateIf(o => o.declared === true)
  @ValidateNested()
  @AtLeastOneRowIsPopulated({message: VALID_ENTER_AT_LEAST_ONE_COURT_ORDER})
    rows: CourtOrder[];

  constructor(declared?: boolean, rows?: CourtOrder[]) {
    this.declared = declared;
    this.rows = rows;
  }

  static fromObject(value?: any): CourtOrders {
    if (!value) {
      return value;
    }

    const declared: boolean = isBooleanable(value.declared) ? boolean(value.declared) : undefined;

    return new CourtOrders(
      declared,
      (declared === true && value.rows) ? value.rows.map(CourtOrder.fromObject) : [],
    );
  }
}
