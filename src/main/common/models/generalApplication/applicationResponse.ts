import {ApplicationUpdate} from 'models/generalApplication/events/eventDto';
import { ApplicationState } from './applicationSummary';

export class ApplicationResponse {
  id: string;
  case_data: CCDApplication;
  state: ApplicationState;
  last_modified: string;
  created_date: string;

  constructor(
    id?: string,
    case_data?: CCDApplication,
    state?: ApplicationState,
    last_modified?: string,
    created_date?: string,
  ) {
    this.id = id;
    this.case_data = case_data;
    this.state = state;
    this.last_modified = last_modified;
    this.created_date = created_date;
  }
}

export interface CCDApplication extends ApplicationUpdate {
  applicationTypes: string;
  legacyCaseReference?: string;
}
