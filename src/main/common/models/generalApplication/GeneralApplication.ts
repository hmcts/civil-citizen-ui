import {YesNo} from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import { InformOtherParties } from './informOtherParties';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {OrderJudge} from './orderJudge';

export class GeneralApplication {

  applicationType?: ApplicationType;
  informOtherParties?: InformOtherParties;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;
  respondentAgreeToOrder?: YesNo;
  requestingReason?: RequestingReason;
  orderJudge?: OrderJudge;

  constructor(
    applicationType?: ApplicationType, 
    agreementFromOtherParty?: YesNo, 
    applicationCosts?: YesNo, 
    respondentAgreeToOrder?: YesNo,
    requestingReason?: RequestingReason,
    orderJudge?: OrderJudge,
  ) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.respondentAgreeToOrder = respondentAgreeToOrder;
    this.requestingReason = requestingReason;
    this.orderJudge = orderJudge;
  }
}
