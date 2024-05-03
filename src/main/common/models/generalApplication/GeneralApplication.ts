import { YesNo } from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import { InformOtherParties } from './informOtherParties';
import {HearingSupport} from 'models/generalApplication/hearingSupport';

export class GeneralApplication {

  applicationType?: ApplicationType;
  informOtherParties?: InformOtherParties;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;

  constructor(applicationType?: ApplicationType, agreementFromOtherParty?: YesNo, applicationCosts?: YesNo) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
  }
}
