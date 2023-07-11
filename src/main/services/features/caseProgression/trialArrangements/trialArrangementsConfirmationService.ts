import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildNextStepsSection,
  getNextStepsTitle,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationBuilder';

export const getTrialArrangementsConfirmationContent = (claimId: string, claim: Claim, lang: string, readyForTrialOrHearing: boolean): ClaimSummarySection[] => {
  const nextStepsTitle = getNextStepsTitle(lang);
  const nextStepsSection = buildNextStepsSection(claimId, claim, lang, readyForTrialOrHearing);
  return [nextStepsTitle, nextStepsSection].flat();
};
