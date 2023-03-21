import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {SelfEmployedAs} from 'models/selfEmployedAs';

export const toCUISelfEmploymentDetails = (selfEmploymentDetails: CCDSelfEmploymentDetails): SelfEmployedAs => {
  return {
    jobTitle:  selfEmploymentDetails?.jobTitle,
    annualTurnover: selfEmploymentDetails?.annualTurnover,
  };
};
