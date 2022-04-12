import {ValidateIf, ValidateNested} from 'class-validator';
import {Form} from '../form';
import {PriorityDebtDetails, DebtDetailsError} from './priorityDebtDetails';

export type DebtType =
  | 'mortgage'
  | 'rent'
  | 'councilTax'
  | 'gas'
  | 'electricity'
  | 'water'
  | 'maintenance';

export interface DebtsError {
  mortgage?: DebtDetailsError;
  rent?: DebtDetailsError;
  councilTax?: DebtDetailsError;
  gas?: DebtDetailsError;
  electricity?: DebtDetailsError;
  water?: DebtDetailsError;
  maintenance?: DebtDetailsError;
}

export class PriorityDebts extends Form {
  @ValidateIf((o: PriorityDebts) => o.mortgage?.populated)
  @ValidateNested()
    mortgage?: PriorityDebtDetails;

  @ValidateIf((o: PriorityDebts) => o.rent?.populated)
  @ValidateNested()
    rent?: PriorityDebtDetails;

  @ValidateIf((o: PriorityDebts) => o.councilTax?.populated)
  @ValidateNested()
    councilTax?: PriorityDebtDetails;

  @ValidateIf((o: PriorityDebts) => o.gas?.populated)
  @ValidateNested()
    gas?: PriorityDebtDetails;

  @ValidateIf((o: PriorityDebts) => o.electricity?.populated)
  @ValidateNested()
    electricity?: PriorityDebtDetails;

  @ValidateIf((o: PriorityDebts) => o.water?.populated)
  @ValidateNested()
    water?: PriorityDebtDetails;

  @ValidateIf((o: PriorityDebts) => o.maintenance?.populated)
  @ValidateNested()
    maintenance?: PriorityDebtDetails;

  constructor(
    mortgage?: PriorityDebtDetails,
    rent?: PriorityDebtDetails,
    councilTax?: PriorityDebtDetails,
    gas?: PriorityDebtDetails,
    electricity?: PriorityDebtDetails,
    water?: PriorityDebtDetails,
    maintenance?: PriorityDebtDetails,
  ) {
    super();
    this.mortgage = mortgage;
    this.rent = rent;
    this.councilTax = councilTax;
    this.gas = gas;
    this.electricity = electricity;
    this.water = water;
    this.maintenance = maintenance;
  }
}
