import {SummarySections} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import {buildYourDetailsSection} from './detailsSection/buildYourDetailsSection';
import {buildTheirDetailsSection} from './detailsSection/buildTheirDetailsSection';
import {buildClaimAmountSection} from './financialSection/buildClaimAmountSection';
import {buildYourTotalClaimAmountSection} from './financialSection/buildTotalClaimAmount';

const buildSummarySections = (claim: Claim, claimId: string, claimFee?: number, lang?: string | unknown): SummarySections => {

  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang),
      buildTheirDetailsSection(claim, claimId, lang),
      buildClaimAmountSection(claim, claimId, lang),
      buildYourTotalClaimAmountSection(claim, claimFee, lang),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, claimFee?: number, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, claimFee, lang);
};
