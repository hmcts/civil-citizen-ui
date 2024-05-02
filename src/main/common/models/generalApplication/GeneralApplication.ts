import { YesNo } from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';
import { InformOtherParties } from './informOtherParties';

export class GeneralApplication {
 
  applicationType?: ApplicationType;
  informOtherParties?: InformOtherParties;
  agreementFromOtherParty?: YesNo;

  constructor(applicationType?: ApplicationType, agreementFromOtherParty?: YesNo) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
  }
}
