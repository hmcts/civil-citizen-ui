import {Application} from 'models/generalApplication/application';
import {CCDApplication} from 'models/generalApplication/applicationResponse';

export const translateCCDCaseDataToCUIModel = (ccdClaimObj: CCDApplication): Application => {
  const application: Application = Object.assign(new Application(), ccdClaimObj);
  return application;
};