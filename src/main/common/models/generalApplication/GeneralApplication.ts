import {YesNo} from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {RequestingReason} from 'models/generalApplication/requestingReason';

export class GeneralApplication {

  applicationType?: ApplicationType;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;
  requestingReason?: RequestingReason;

  constructor(applicationType?: ApplicationType, agreementFromOtherParty?: YesNo, applicationCosts?: YesNo, requestingReason?: RequestingReason) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.requestingReason = requestingReason;
  }
}
