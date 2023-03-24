import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {SelfEmployedAs} from 'models/selfEmployedAs';

export const toCUISelfEmploymentDetails = (selfEmploymentDetails: CCDSelfEmploymentDetails): SelfEmployedAs => {
  if (!selfEmploymentDetails) return undefined;

  return {
    jobTitle:  selfEmploymentDetails.jobTitle,
    annualTurnover: selfEmploymentDetails.annualTurnover,
  };
};
