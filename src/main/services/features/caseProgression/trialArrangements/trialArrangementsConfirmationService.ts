import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getConfirmationPageSection,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationContent';

export const getTrialArrangementsConfirmationContent = (claimId: string, claim: Claim, readyForTrialOrHearing: boolean): ClaimSummarySection[] => {
  return getConfirmationPageSection(claimId, claim, readyForTrialOrHearing);
};
