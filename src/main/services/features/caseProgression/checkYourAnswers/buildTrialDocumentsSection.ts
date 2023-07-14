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

export const buildTrialDocumentsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {

  const TrialDocumentsSection : SummarySections = null;

  TrialDocumentsSection.sections.push(buildCaseSummarySection(claim, claimId, lang));
  TrialDocumentsSection.sections.push(buildSkeletonArgumentSection(claim, claimId, lang));
  TrialDocumentsSection.sections.push(buildLegalAuthoritiesSection(claim, claimId, lang));
  TrialDocumentsSection.sections.push(buildCostsSection(claim, claimId, lang));
  TrialDocumentsSection.sections.push(builDocumentaryEvidenceSection(claim, claimId, lang));

  return TrialDocumentsSection;
};

export const buildCaseSummarySection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let CaseSummarySection: SummarySection = null;

  CaseSummarySection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.TRIAL_HEARING_DOCUMENTS.CASE_SUMMARY', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  CaseSummarySection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return CaseSummarySection;
};

export const buildSkeletonArgumentSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let SkeletonArgumentSection: SummarySection = null;

  SkeletonArgumentSection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.TRIAL_HEARING_DOCUMENTS.SKELETON_ARGUMENT', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  SkeletonArgumentSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return SkeletonArgumentSection;
};

export const buildLegalAuthoritiesSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let LegalAuthoritiesSection: SummarySection = null;

  LegalAuthoritiesSection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.TRIAL_HEARING_DOCUMENTS.LEGAL_AUTHORITIES', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  LegalAuthoritiesSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return LegalAuthoritiesSection;
};

export const buildCostsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let CostsSection: SummarySection = null;

  CostsSection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.TRIAL_HEARING_DOCUMENTS.COSTS', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  CostsSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return CostsSection;
};

export const builDocumentaryEvidenceSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let DocumentaryEvidence: SummarySection = null;

  DocumentaryEvidence = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.TRIAL_HEARING_DOCUMENTS.DOCUMENTARY_EVIDENCE_TRIAL', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  DocumentaryEvidence.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.DOCUMENT_TYPE', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  DocumentaryEvidence.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.DATE_DOCUMENT', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));
  DocumentaryEvidence.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return DocumentaryEvidence;
};
