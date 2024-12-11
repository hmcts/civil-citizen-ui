import {Claim} from 'models/claim';
import {
  addApplicationTypeRow, addAddAnotherApplicationRow,
  addAskForCostsRow, addHearingContactDetailsRows, addHearingArrangementsRows, addHearingSupportRows,
  addInformOtherPartiesRow, addOrderJudgeRow,
  addOtherPartiesAgreedRow, addUnavailableDatesRows, addDocumentUploadRow,
  addFinalPaymentDateRows, addCoScDocumentUploadRow, addHasEvidenceOfDebtPaymentRow, addRequestingReasonRow,
  addN245Row,
} from './addCheckAnswersRows';
import {SummaryCard, SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';

const buildSummarySections = (claimId: string, claim: Claim, lang: string ): SummaryRow[] => {
  const summaryRows: SummaryRow[] = [];
  const singleAppType = claim.generalApplication?.applicationTypes?.length === 1;
  if (singleAppType) {
    summaryRows.push(...addApplicationTypeRow(claimId, claim, 0, lang));
  }
  summaryRows.push(
    ...addAddAnotherApplicationRow(claimId, claim, lang),
    ...addOtherPartiesAgreedRow(claimId, claim, lang),
    ...addInformOtherPartiesRow(claimId, claim, lang),
    ...addAskForCostsRow(claimId, claim, lang),
  );
  if (singleAppType) {
    summaryRows.push(
      ...addOrderJudgeRow(claimId, claim, 0, lang),
      ...addRequestingReasonRow(claimId, claim, 0, lang),
    );
  }
  summaryRows.push(
    ...addN245Row(claimId, claim, lang),
    ...addDocumentUploadRow(claimId, claim, lang),
    ...addHearingArrangementsRows(claimId, claim, lang),
    ...addHearingContactDetailsRows(claimId, claim, lang),
    ...addUnavailableDatesRows(claimId, claim, lang),
    ...addHearingSupportRows(claimId, claim, lang),
  );
  return summaryRows;
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string): SummaryRow[] => {
  return buildSummarySections(claimId, claim, lang);
};

export const getSummaryCardSections = (claimId: string, claim: Claim, lang?: string): SummaryCard[] => {
  const lng = getLng(lang);
  const singleAppType = claim.generalApplication?.applicationTypes?.length === 1;
  if (singleAppType) {
    // Only use summary cards if there are multiple app types
    return null;
  }
  const summaryCards: SummaryCard[] = [];
  claim.generalApplication?.applicationTypes?.forEach((value, index) => {
    summaryCards.push({
      card: {
        title: {text: `${t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION', {lng})} ${index + 1}`},
      },
      rows: [
        ...addApplicationTypeRow(claimId, claim, index, lng),
        ...addOrderJudgeRow(claimId, claim, index, lng),
        ...addRequestingReasonRow(claimId, claim, index, lng),
      ],
    });
  });
  return summaryCards;
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
