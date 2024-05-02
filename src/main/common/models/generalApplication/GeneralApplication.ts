import {ApplicationType} from './applicationType';
import { InformOtherParties } from './informOtherParties';

export class GeneralApplication {
 
  applicationType?: ApplicationType;
  informOtherParties?: InformOtherParties;

  constructor(applicationType?: ApplicationType) {
    this.applicationType = applicationType;
  }
}
