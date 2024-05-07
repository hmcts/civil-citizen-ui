import { YesNo } from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import {HearingSupport} from 'models/generalApplication/hearingSupport';

export class GeneralApplication {

  applicationType?: ApplicationType;
  hearingSupport?: HearingSupport;
  agreementFromOtherParty?: YesNo;
  applyHelpWithFees?: YesNo;

  constructor(applicationType?: ApplicationType, agreementFromOtherParty?: YesNo) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
  }
}
