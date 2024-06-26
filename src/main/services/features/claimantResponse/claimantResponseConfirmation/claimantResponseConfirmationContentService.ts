import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {
  buildClaimantResponseSection,
  buildNextStepsSection,
} from './confirmationContentBuilder/confirmationContentBuilder';

export const getClaimantResponseConfirmationContent = (claim: Claim, lang: string, carmApplicable: boolean, respondToSettlementAgreementDeadLine?: Date): ClaimSummarySection[] => {
  const claimantResponseSection = buildClaimantResponseSection(claim, lang);
  const nextStepsSection = buildNextStepsSection(claim, lang, carmApplicable, respondToSettlementAgreementDeadLine);

  return [
    claimantResponseSection,
    nextStepsSection,
  ].flat();
};
