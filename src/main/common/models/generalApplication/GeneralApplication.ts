import {YesNo} from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import { InformOtherParties } from './informOtherParties';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {OrderJudge} from './orderJudge';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import { RespondentAgreement } from './respondentAgreement';

export class GeneralApplication {

  applicationType?: ApplicationType;
  informOtherParties?: InformOtherParties;
  hearingSupport?: HearingSupport;
  respondentAgreement?: RespondentAgreement;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;
  respondentAgreeToOrder?: YesNo;
  requestingReason?: RequestingReason;
  orderJudge?: OrderJudge;
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;

  constructor(
    applicationType?: ApplicationType,
    agreementFromOtherParty?: YesNo,
    applicationCosts?: YesNo,
    respondentAgreeToOrder?: YesNo,
    respondentAgreement?: RespondentAgreement,
    requestingReason?: RequestingReason,
    orderJudge?: OrderJudge,
    hearingArrangement?: HearingArrangement,
    hearingContactDetails?: HearingContactDetails,
    
  ) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.respondentAgreeToOrder = respondentAgreeToOrder;
    this.respondentAgreement= respondentAgreement;
    this.requestingReason = requestingReason;
    this.orderJudge = orderJudge;
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
  }
}
