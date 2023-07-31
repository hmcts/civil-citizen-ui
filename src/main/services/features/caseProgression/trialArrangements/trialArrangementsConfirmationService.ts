import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getNextStepsSection,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationContent';

export const getTrialArrangementsConfirmationContent = (claimId: string, claim: Claim, lang: string, readyForTrialOrHearing: boolean): ClaimSummarySection[] => {
  return getNextStepsSection(claimId, claim, lang, readyForTrialOrHearing);
};
