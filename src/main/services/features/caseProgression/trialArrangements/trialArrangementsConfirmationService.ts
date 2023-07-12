import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getNextStepsSection,
  getNextStepsTitle,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationContent';

export const getTrialArrangementsConfirmationContent = (claimId: string, claim: Claim, lang: string, readyForTrialOrHearing: boolean): ClaimSummarySection[] => {
  const nextStepsTitle = getNextStepsTitle(lang);
  const nextStepsSection = getNextStepsSection(claimId, claim, lang, readyForTrialOrHearing);
  return [nextStepsTitle, nextStepsSection].flat();
};
