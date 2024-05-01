import {ApplicationType} from './applicationType';
import { YesNo } from 'common/form/models/yesNo';

export class GeneralApplication {
 
  applicationType?: ApplicationType;
  applicationCosts?: YesNo;

  constructor(applicationType?: ApplicationType, applicationCosts?: YesNo) {
    this.applicationType = applicationType;
    this.applicationCosts = applicationCosts;
  }
}
