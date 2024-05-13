import {YesNo} from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import { InformOtherParties } from './informOtherParties';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';

export class GeneralApplication {

  applicationType?: ApplicationType;
  informOtherParties?: InformOtherParties;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;
  respondentAgreeToOrder?: YesNo;
  requestingReason?: RequestingReason;
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;

  constructor(applicationType?: ApplicationType, agreementFromOtherParty?: YesNo, applicationCosts?: YesNo, respondentAgreeToOrder?: YesNo, requestingReason?: RequestingReason, 
    hearingArrangement?: HearingArrangement,  hearingContactDetails?: HearingContactDetails) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.respondentAgreeToOrder = respondentAgreeToOrder;
    this.requestingReason = requestingReason;
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
  }
}
