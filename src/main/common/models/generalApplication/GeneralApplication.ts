import { YesNo } from 'common/form/models/yesNo';
import {ApplicationType} from './applicationType';

export class GeneralApplication {
 
  applicationType?: ApplicationType;
  agreementFromOtherParty?: YesNo;

  constructor(applicationType?: ApplicationType, agreementFromOtherParty?: YesNo) {
    this.applicationType = applicationType;
    this.agreementFromOtherParty = agreementFromOtherParty;
  }
}
