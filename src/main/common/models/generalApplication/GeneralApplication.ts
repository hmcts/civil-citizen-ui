import { YesNo } from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import {HearingSupport} from 'models/generalApplication/hearingSupport';

export class GeneralApplication {

  applicationType?: ApplicationType;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;
  respondentAgreeToOrder?: YesNo;

  constructor(applicationType?: ApplicationType, agreementFromOtherParty?: YesNo, applicationCosts?: YesNo, respondentAgreeToOrder?: YesNo) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.respondentAgreeToOrder = respondentAgreeToOrder;
  }
}
