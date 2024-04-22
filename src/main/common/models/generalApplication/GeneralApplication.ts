import {ApplicationType} from "./applicationType";

export class GeneralApplication {
 
  applicationType?: ApplicationType;

  constructor(applicationType?: ApplicationType) {
    this.applicationType = applicationType;
  }
}

