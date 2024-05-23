import {YesNo} from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import { InformOtherParties } from './informOtherParties';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {OrderJudge} from './orderJudge';
import { UploadGAFiles } from './uploadGAFiles';
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
  orderJudge?: OrderJudge;
  uploadN245Form?: UploadGAFiles;
  hearingArrangement?: HearingArrangement;
  hearingContactDetails?: HearingContactDetails;

  constructor(
    applicationType?: ApplicationType,
    agreementFromOtherParty?: YesNo,
    applicationCosts?: YesNo,
    respondentAgreeToOrder?: YesNo,
    requestingReason?: RequestingReason,
    orderJudge?: OrderJudge,
    hearingArrangement?: HearingArrangement,
    hearingContactDetails?: HearingContactDetails,
  ) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
    this.respondentAgreeToOrder = respondentAgreeToOrder;
    this.requestingReason = requestingReason;
    this.orderJudge = orderJudge;
    this.hearingArrangement = hearingArrangement;
    this.hearingContactDetails = hearingContactDetails;
  }
}
