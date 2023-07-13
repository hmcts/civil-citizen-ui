import {SummarySection, summarySection, SummarySections} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import {summaryRow} from '../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {
  CP_UPLOAD_DOCUMENTS_URL,
} from '../../../../routes/urls';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const buildWitnessEvidenceSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {

  const WitnessEvidenceSection : SummarySections = null;

  WitnessEvidenceSection.sections.push(buildWitnessStatementSection(claim, claimId, lang));
  WitnessEvidenceSection.sections.push(buildWitnessSummarySection(claim, claimId, lang));
  WitnessEvidenceSection.sections.push(buildNoticeOfIntentionSection(claim, claimId, lang));
  WitnessEvidenceSection.sections.push(buildDocumentsReferredSection(claim, claimId, lang));

  return WitnessEvidenceSection;
};

export const buildWitnessStatementSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let WitnessEvidenceSection: SummarySection = null;

  WitnessEvidenceSection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.WITNESS_STATEMENT', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  WitnessEvidenceSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.WITNESS_NAME', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  WitnessEvidenceSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.DATE_STATEMENT', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));
  WitnessEvidenceSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return WitnessEvidenceSection;
};

export const buildWitnessSummarySection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let WitnessSummarySection: SummarySection = null;

  WitnessSummarySection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.WITNESS_SUMMARY', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  WitnessSummarySection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.WITNESS_NAME', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  WitnessSummarySection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.DATE_STATEMENT', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));
  WitnessSummarySection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return WitnessSummarySection;
};

export const buildNoticeOfIntentionSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let NoticeOfIntentionSection: SummarySection = null;

  NoticeOfIntentionSection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.WITNESS_SUMMARY', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  NoticeOfIntentionSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.WITNESS_NAME', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  NoticeOfIntentionSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.DATE_STATEMENT', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));
  NoticeOfIntentionSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return NoticeOfIntentionSection;
};

export const buildDocumentsReferredSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let DocumentsReferred: SummarySection = null;

  DocumentsReferred = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.DOCUMENTS_REFERRED', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  DocumentsReferred.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.DOCUMENT_TYPE', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  DocumentsReferred.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.DATE_STATEMENT', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));
  DocumentsReferred.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return DocumentsReferred;
};
