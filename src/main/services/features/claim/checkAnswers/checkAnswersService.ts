import {SummarySections} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import {buildYourDetailsSection} from '../../claim/checkAnswers/detailsSection/buildYourDetailsSection';
import {buildTheirDetailsSection} from '../../claim/checkAnswers/detailsSection/buildTheirDetailsSection';
import {buildClaimAmountSection} from './financialSection/buildClaimAmountSection';
//const {Logger} = require('@hmcts/nodejs-logging'); TODO add logger
//const logger = Logger.getLogger('checkAnswersService');

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {

  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang),
      buildTheirDetailsSection(claim, claimId, lang),
      buildClaimAmountSection(claim, claimId, lang),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
};
