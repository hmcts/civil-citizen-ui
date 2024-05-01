import {ApplicationType} from './applicationType';
import {HearingSupport} from 'models/generalApplication/hearingSupport';

export class GeneralApplication {

  applicationType?: ApplicationType;
  hearingSupport?: HearingSupport;

  constructor(applicationType?: ApplicationType) {
    this.applicationType = applicationType;
  }
}
