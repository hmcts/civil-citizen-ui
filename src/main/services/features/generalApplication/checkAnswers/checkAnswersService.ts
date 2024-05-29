import {Claim} from 'models/claim';
import {
  addApplicationTypesRows,
  addAskForCostsRow, addHearingContactDetailsRows, addHearingArrangementsRows, addHearingSupportRows,
  addInformOtherPartiesRow, addOrderJudgeRows,
  addOtherPartiesAgreedRow, addRequestingReasonRows, addUnavailableDatesRows, addDocumentUploadRow,
} from './addCheckAnswersRows';
import {SummaryRow} from 'models/summaryList/summaryList';

const buildSummarySections = (claimId: string, claim: Claim, lang: string ): SummaryRow[] => {
  return [
    ...addApplicationTypesRows(claimId, claim, lang),
    ...addOtherPartiesAgreedRow(claimId, claim, lang),
    ...addInformOtherPartiesRow(claimId, claim, lang),
    ...addAskForCostsRow(claimId, claim, lang),
    ...addOrderJudgeRows(claimId, claim, lang),
    ...addRequestingReasonRows(claimId, claim, lang),
    ...addDocumentUploadRow(claimId, claim, lang),
    ...addHearingArrangementsRows(claimId, claim, lang),
    ...addHearingContactDetailsRows(claimId, claim, lang),
    ...addUnavailableDatesRows(claimId, claim, lang),
    ...addHearingSupportRows(claimId, claim, lang),
  ];
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string ): SummaryRow[] => {
  return buildSummarySections(claimId, claim, lang);
};
