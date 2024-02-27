import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {
  buildClaimantResponseSection,
  buildNextStepsSection,
} from './confirmationContentBuilder/confirmationContentBuilder';

export const getClaimantResponseConfirmationContent = (claim: Claim, lang: string, carmApplicable: boolean): ClaimSummarySection[] => {
  const claimantResponseSection = buildClaimantResponseSection(claim, lang);
  const nextStepsSection = buildNextStepsSection(claim, lang, carmApplicable);

  return [
    claimantResponseSection,
    nextStepsSection,
  ].flat();
};
