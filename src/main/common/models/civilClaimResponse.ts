import {Claim} from './claim';

export class CivilClaimResponse {
  id: string;
  case_data: Claim;

  constructor(id?: string, case_data?: Claim) {
    this.id = id;
    this.case_data = case_data;
  }
}
