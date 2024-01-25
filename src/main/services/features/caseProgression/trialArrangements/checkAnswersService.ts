import {SummarySections} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import {
  buildCaseInfoContents,
  buildIsCaseReadyForTrialOrHearing,
} from 'services/features/response/checkAnswers/caseProgression/trialArrangements/buildTrialReadyConfirmationSection';
import {ClaimSummarySection} from 'form/models/claimSummarySection';

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {
  return {
    sections: [
      buildIsCaseReadyForTrialOrHearing(claim, claimId, lang),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
};

export const getCaseInfoContents = (claimId: string, claim: Claim): ClaimSummarySection[] => {
  return buildCaseInfoContents(claim, claimId);
};
