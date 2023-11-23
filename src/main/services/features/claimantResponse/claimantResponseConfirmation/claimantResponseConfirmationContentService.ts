import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {
  buildClaimantResponseSection, 
  buildNextStepsSection, 
} from './confirmationContentBuilder/confirmationContentBuilder';

export const getClaimantResponseConfirmationContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantResponseSection = buildClaimantResponseSection(claim, lang);
  const nextStepsSection = buildNextStepsSection(claim, lang);

  return [
    claimantResponseSection, 
    nextStepsSection, 
  ].flat();
};
