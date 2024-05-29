import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {CcdGeneralApplicationTypes} from 'models/ccdGeneralApplication/ccdGeneralApplicationTypes';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  CcdGeneralApplicationInformOtherParty,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationInformOtherParty';
import {CcdGeneralApplicationHearingDetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import {
  CcdGeneralApplicationEvidenceDocument
} from 'models/ccdGeneralApplication/ccdGeneralApplicationEvidenceDocument';

export interface EventDto {
  event: ApplicationEvent,
  caseDataUpdate?: CCDGeneralApplication;
}

export interface CCDGeneralApplication {
  generalAppType: CcdGeneralApplicationTypes;
  generalAppConsentOrder: YesNoUpperCamelCase;
  generalAppInformOtherParty: CcdGeneralApplicationInformOtherParty;
  generalAppAskForCosts: YesNoUpperCamelCase;
  generalAppDetailsOfOrder: string;
  generalAppReasonsOfOrder: string;
  generalAppEvidenceDocument: CcdGeneralApplicationEvidenceDocument[],
  generalAppHearingDetails: CcdGeneralApplicationHearingDetails;
}
