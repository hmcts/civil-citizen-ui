import {ApplicationUpdate} from 'models/generalApplication/events/eventDto';
import { ApplicationState } from './applicationSummary';
import {CcdGeneralApplicationTypes} from 'models/ccdGeneralApplication/ccdGeneralApplicationTypes';
import {
  CcdGeneralApplicationRespondentAgreement,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationRespondentAgreement';
import {
  CcdGeneralApplicationInformOtherParty,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationInformOtherParty';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  CcdGeneralApplicationEvidenceDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationEvidenceDocument';
import {CcdGeneralApplicationHearingDetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import {
  CcdGeneralApplicationStatementOfTruth,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationStatementOfTruth';
import {CcdGeneralApplicationAddlDocument} from 'models/ccdGeneralApplication/ccdGeneralApplicationAddlDocument';
import {CcdGeneralApplicationPBADetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationPBADetails';

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
  generalAppType: CcdGeneralApplicationTypes;
  generalAppRespondentAgreement: CcdGeneralApplicationRespondentAgreement;
  generalAppInformOtherParty: CcdGeneralApplicationInformOtherParty;
  generalAppAskForCosts: YesNoUpperCamelCase;
  generalAppDetailsOfOrder: string;
  generalAppReasonsOfOrder: string;
  generalAppEvidenceDocument: CcdGeneralApplicationEvidenceDocument[];
  gaAddlDoc: CcdGeneralApplicationAddlDocument[];
  generalAppHearingDetails: CcdGeneralApplicationHearingDetails;
  generalAppStatementOfTruth: CcdGeneralApplicationStatementOfTruth;
  generalAppPBADetails: CcdGeneralApplicationPBADetails;
  applicationFeeAmountInPence: string;
}
