import { YesNo } from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import { OrderJudge } from './orderJudge';

export class GeneralApplication {

  applicationType?: ApplicationType;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applicationCosts?: YesNo;
  orderJudge?: OrderJudge;

  constructor(applicationType?: ApplicationType, agreementFromOtherParty?: YesNo, applicationCosts?: YesNo) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.applicationCosts = applicationCosts;
  }
}
