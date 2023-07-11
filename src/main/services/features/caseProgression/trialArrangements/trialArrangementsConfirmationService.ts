import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildNextStepsSection,
  getNextStepsTitle,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationBuilder';

export const getTrialArrangementsConfirmationContent = (readyForTrialOrHearing: boolean, lang: string): ClaimSummarySection[] => {
  const nextStepsTitle = getNextStepsTitle(lang);
  const nextStepsSection = buildNextStepsSection(readyForTrialOrHearing, lang);
  return [nextStepsTitle, nextStepsSection].flat();
};
