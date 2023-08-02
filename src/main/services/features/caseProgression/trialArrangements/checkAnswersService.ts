import {SummarySections} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import {
  buildIsCaseReadyForTrialOrHearing,
} from 'services/features/response/checkAnswers/caseProgression/trialArrangements/buildTrialReadyConfirmationSection';


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

