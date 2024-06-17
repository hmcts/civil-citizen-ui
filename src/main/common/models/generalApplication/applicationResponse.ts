import {ApplicationUpdate} from 'models/generalApplication/events/eventDto';
import {CaseState} from 'form/models/claimDetails';
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
  generalAppType: CcdGeneralApplicationTypes;
  generalAppRespondentAgreement: CcdGeneralApplicationRespondentAgreement;
  generalAppInformOtherParty: CcdGeneralApplicationInformOtherParty;
  generalAppAskForCosts: YesNoUpperCamelCase;
  generalAppDetailsOfOrder: string;
  generalAppReasonsOfOrder: string;
  generalAppEvidenceDocument: CcdGeneralApplicationEvidenceDocument[];
  generalAppHearingDetails: CcdGeneralApplicationHearingDetails;
  generalAppStatementOfTruth: CcdGeneralApplicationStatementOfTruth;
}
