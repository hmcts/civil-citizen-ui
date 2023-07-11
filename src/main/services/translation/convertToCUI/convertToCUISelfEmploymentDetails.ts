import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {SelfEmployedAs} from 'models/selfEmployedAs';
import {convertToPound} from 'services/translation/claim/moneyConversation';

export const toCUISelfEmploymentDetails = (selfEmploymentDetails: CCDSelfEmploymentDetails): SelfEmployedAs => {
  if (selfEmploymentDetails) {
    return {
      jobTitle: selfEmploymentDetails.jobTitle,
      annualTurnover: convertToPound(selfEmploymentDetails.annualTurnover),
    };
  }
};
