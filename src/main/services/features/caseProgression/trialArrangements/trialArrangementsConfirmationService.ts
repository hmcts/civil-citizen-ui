import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getNextStepsTitle,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationBuilder';

export const getTrialArrangementsConfirmationContent = (claimId: string, claim: Claim, lang: string, readyForTrialOrHearing: boolean): ClaimSummarySection[] => {
  const nextStepsTitle = getNextStepsTitle(lang);
  return [nextStepsTitle].flat();
};
