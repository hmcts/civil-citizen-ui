import { YesNo } from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';

export class GeneralApplication {

  applicationType?: ApplicationType;
  agreementFromOtherParty?: YesNo;
  respondentAgreeToOrder?: YesNo;

  constructor(applicationType?: ApplicationType, agreementFromOtherParty?: YesNo, agreeToOrder?: YesNo) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
    this.respondentAgreeToOrder = agreeToOrder;
  }
}
