import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildNextStepsSection,
  buildPanelSection
} from 'services/features/settlementAgreement/settlementAgreementConfirmationBuilder/confirmationContentBuilder';

export const getRespondSettlementAgreementConfirmationContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantResponseSection = buildPanelSection(claim, lang);
  const nextStepsSection = buildNextStepsSection(claim, lang);
  return [claimantResponseSection, nextStepsSection].flat();
};
