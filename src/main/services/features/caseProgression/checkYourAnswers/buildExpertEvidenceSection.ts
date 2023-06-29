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

export const buildExpertEvidenceSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {

  const ExpertEvidenceSection : SummarySections = null;

  ExpertEvidenceSection.sections.push(buildExpertReportSection(claim, claimId, lang));
  ExpertEvidenceSection.sections.push(buildJointStatementSection(claim, claimId, lang));

  return ExpertEvidenceSection;
};

export const buildExpertReportSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let ExpertReportSection: SummarySection = null;

  ExpertReportSection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.EXPERT_EVIDENCE.EXPERT_REPORT', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  ExpertReportSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.EXPERT_EVIDENCE.EXPERT_NAME', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  ExpertReportSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.EXPERT_EVIDENCE.FIELD_OF_EXPERTISE', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  ExpertReportSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.EXPERT_EVIDENCE.DATE_STATEMENT', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));
  ExpertReportSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return ExpertReportSection;
};

export const buildJointStatementSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let JointStatementSection: SummarySection = null;

  JointStatementSection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.JOINT_STATEMENT_OF_EXPERTS', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  JointStatementSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.EXPERT_NAMES', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  JointStatementSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.FIELD_OF_EXPERTISE', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  JointStatementSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.WITNESS_EVIDENCE.DATE_STATEMENT', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));
  JointStatementSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return JointStatementSection;
};
