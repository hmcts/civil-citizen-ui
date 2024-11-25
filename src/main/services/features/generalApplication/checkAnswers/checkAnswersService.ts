import {Claim} from 'models/claim';
import {
  addApplicationTypesRows, addAddAnotherApplicationRow,
  addAskForCostsRow, addHearingContactDetailsRows, addHearingArrangementsRows, addHearingSupportRows,
  addInformOtherPartiesRow, addOrderJudgeRows,
  addOtherPartiesAgreedRow, addRequestingReasonRows, addUnavailableDatesRows, addDocumentUploadRow,
  addFinalPaymentDateRows, addCoScDocumentUploadRow, addHasEvidenceOfDebtPaymentRow, addN245Row,
} from './addCheckAnswersRows';
import {SummaryRow} from 'models/summaryList/summaryList';

const buildSummarySections = (claimId: string, claim: Claim, lang: string ): SummaryRow[] => {
  return [
    ...addApplicationTypesRows(claimId, claim, lang),
    ...addAddAnotherApplicationRow(claimId, claim, lang),
    ...addOtherPartiesAgreedRow(claimId, claim, lang),
    ...addInformOtherPartiesRow(claimId, claim, lang),
    ...addAskForCostsRow(claimId, claim, lang),
    ...addOrderJudgeRows(claimId, claim, lang),
    ...addRequestingReasonRows(claimId, claim, lang),
    ...addN245Row(claimId, claim, lang),
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

const buildCoScSummarySections = (claimId: string, claim: Claim, lang: string ): SummaryRow[] => {
  return [
    ...addFinalPaymentDateRows(claimId, claim, lang),
    ...addHasEvidenceOfDebtPaymentRow(claimId, claim, lang),
    ...addCoScDocumentUploadRow(claimId, claim, lang),
  ];
};

export const getCoScSummarySections = (claimId: string, claim: Claim, lang?: string ): SummaryRow[] => {
  return buildCoScSummarySections(claimId, claim, lang);
};
