import {Claim} from './claim';
import {CaseState} from '../form/models/claimDetails';

export class CivilClaimResponse {
  id: string;
  case_data: Claim;
  state: CaseState;
  constructor(
    id?: string,
    case_data?: Claim,
    state?: CaseState,
  ) {
    this.id = id;
    this.case_data = case_data;
    this.state = state;
  }
}
