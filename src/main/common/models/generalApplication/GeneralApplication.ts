import {ApplicationType} from './applicationType';
import {YesNo} from 'form/models/yesNo';

export class GeneralApplication {

  applicationType?: ApplicationType;
  respondentAgreeToOrder?: YesNo;

  constructor(applicationType?: ApplicationType, agreeToOrder?: YesNo) {
    this.applicationType = applicationType;
    this.respondentAgreeToOrder = agreeToOrder;
  }
}
