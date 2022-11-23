import {SummarySections} from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {buildYourDetailsSection} from './detailsSection/buildYourDetailsSection';
import {buildTheirDetailsSection} from './detailsSection/buildTheirDetailsSection';
import {buildClaimAmountSection} from './financialSection/buildClaimAmountSection';

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
