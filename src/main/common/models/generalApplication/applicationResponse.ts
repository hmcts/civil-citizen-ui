import {ApplicationUpdate} from 'models/generalApplication/events/eventDto';
import {CaseState} from 'form/models/claimDetails';

export class ApplicationResponse {
  id: string;
  case_data: CCDApplication;
  state: CaseState;
  last_modified: Date;

  constructor(
    id?: string,
    case_data?: CCDApplication,
    state?: CaseState,
    last_modified?: Date,
  ) {
    this.id = id;
    this.case_data = case_data;
    this.state = state;
    this.last_modified = last_modified;
  }
}

export interface CCDApplication extends ApplicationUpdate {
  legacyCaseReference?: string;
}
