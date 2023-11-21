import {ClaimSummarySection} from 'common/form/models/claimSummarySection';
import {Claim} from 'common/models/claim';
import {
  buildClaimantResponseSection, 
  buildCourtBelievesCanAffordSection, 
  buildCourtBelievesCanntAffordSection, 
  buildNextStepsSection, 
  buildSendFinancialDetailsSection, 
  buildUseThisAddressSection,
} from './confirmationContentBuilder/confirmationContentBuilder';

export const getClaimantResponseConfirmationContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantResponseSection = buildClaimantResponseSection(claim, lang);
  const nextStepsSection = buildNextStepsSection(claim, lang);
  const sendFinancialDetails = buildSendFinancialDetailsSection(claim, lang);
  const useThisAddressSection = buildUseThisAddressSection(claim, lang);
  const courtBelievesCanAfford = buildCourtBelievesCanAffordSection(claim, lang);
  const courtBelievesCanntAfford = buildCourtBelievesCanntAffordSection(claim, lang);

  return [
    claimantResponseSection, 
    nextStepsSection, 
    sendFinancialDetails, 
    useThisAddressSection, 
    courtBelievesCanAfford,
    courtBelievesCanntAfford,
  ].flat();
};
