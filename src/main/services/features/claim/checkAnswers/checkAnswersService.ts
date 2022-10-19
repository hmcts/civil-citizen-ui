import {SummarySections} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import {PaymentOptionType} from '../../../../common/form/models/admission/paymentOption/paymentOptionType';
import {buildYourDetailsSection} from '../../response/checkAnswers/detailsSection/buildYourDetailsSection';
import {
  buildYourResponseToClaimSection
} from '../../response/checkAnswers/responseSection/buildYourResponseToClaimSection';
import {
  buildYourResponseDetailsSection
} from '../../response/checkAnswers/responseSection/buildYourResponseDetailsSection';

//const {Logger} = require('@hmcts/nodejs-logging'); TODO add logger
//const logger = Logger.getLogger('checkAnswersService');

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {
  const paymentOption: string = claim.paymentOption;

  const getResponseToClaim = () => {
    return claim.isFullDefence()
    || claim.isFullAdmission() && paymentOption !== PaymentOptionType.IMMEDIATELY
      ? buildYourResponseToClaimSection(claim, claimId, lang)
      : null;
  };

  const getResponseToClaimPA = () => {
    return claim.isPartialAdmission()
      ? buildYourResponseToClaimSection(claim, claimId, lang)
      : null;
  };

  const getResponseDetailsSection = () => {
    return claim.isFullDefence() || claim.isPartialAdmission()
      ? buildYourResponseDetailsSection(claim, claimId, lang)
      : null;
  };

  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang),
      getResponseToClaim(),
      getResponseToClaimPA(),
      getResponseDetailsSection(),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
};
