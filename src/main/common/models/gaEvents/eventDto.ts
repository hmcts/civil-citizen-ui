import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {CcdGeneralApplicationTypes} from 'models/ccdGeneralApplication/ccdGeneralApplicationTypes';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  CcdGeneralApplicationInformOtherParty,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationInformOtherParty';
import {CcdGeneralApplicationHearingDetails} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';

export interface EventDto {
  event: ApplicationEvent,
  generalApplicationUpdate?: CCDGeneralApplication;
}

export interface CCDGeneralApplication {
  generalAppType: CcdGeneralApplicationTypes;
  generalAppConsentOrder: YesNoUpperCamelCase;
  generalAppInformOtherParty: CcdGeneralApplicationInformOtherParty;
  generalAppDetailsOfOrder: string;
  generalAppReasonsOfOrder: string;
  generalAppHearingDetails: CcdGeneralApplicationHearingDetails;
}
