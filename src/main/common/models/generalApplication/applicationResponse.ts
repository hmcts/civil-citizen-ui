//import {ApplicationUpdate} from 'models/generalApplication/events/eventDto';
import {CaseState} from 'form/models/claimDetails';
import { CCDGeneralApplication } from '../gaEvents/eventDto';

export class ApplicationResponse {
  id: string;
  case_data: CCDGeneralApplication;
  state: CaseState;
  last_modified: Date;
  created_date: string;

  constructor(
    id?: string,
    case_data?: CCDGeneralApplication,
    state?: CaseState,
    last_modified?: Date,
    created_date?: string,
  ) {
    this.id = id;
    this.case_data = case_data;
    this.state = state;
    this.last_modified = last_modified;
    this.created_date = created_date;
  }
}

// export interface CCDApplication extends ApplicationUpdate {
//   legacyCaseReference?: string;
// }
