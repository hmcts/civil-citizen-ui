import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {boolean, isBooleanable} from 'common/utils/boolean';
import {CourtOrder} from './courtOrder';
import {AtLeastOneRowIsPopulated} from 'form/validators/atLeastOneRowIsPopulated';

export class CourtOrders {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION'})
    declared: boolean;

  @ValidateIf(o => o.declared === true)
  @ValidateNested()
  @AtLeastOneRowIsPopulated({message: 'ERRORS.VALID_ENTER_AT_LEAST_ONE_COURT_ORDER'})
    rows: CourtOrder[];

  constructor(declared?: boolean, rows?: CourtOrder[]) {
    this.declared = declared;
    this.rows = rows;
  }

  static fromObject(value?: Record<string, object>): CourtOrders {
    if (!value) {
      return undefined;
    }

    const declared: boolean = isBooleanable(value.declared) ? boolean(value.declared) : undefined;

    return new CourtOrders(
      declared,
      (declared === true && value.rows) ? ((value.rows) as Array<Record<string,string>>).map(CourtOrder.fromObject) : [],
    );
  }
}
