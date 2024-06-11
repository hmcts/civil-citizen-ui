import {ApplicationUpdate} from 'models/generalApplication/events/eventDto';
import {CaseState} from 'form/models/claimDetails';

export class ApplicationResponse {
  id: string;
  case_data: CCDApplication;
  state: CaseState;
  last_modified: Date;
  created_date: Date;

  constructor(
    id?: string,
    case_data?: CCDApplication,
    state?: CaseState,
    last_modified?: Date,
    created_date?: Date,
  ) {
    this.id = id;
    this.case_data = case_data;
    this.state = state;
    this.last_modified = last_modified;
    this.created_date = created_date;
  }
}

export interface CCDApplication extends ApplicationUpdate {
  legacyCaseReference?: string;
}
