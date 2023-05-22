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

export const buildDisclosureSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {

  const DisclosureSection : SummarySections = null;

  DisclosureSection.sections.push(buildDisclosureDocumentsSection(claim, claimId, lang));
  DisclosureSection.sections.push(buildDisclosureListSection(claim, claimId, lang));

  return DisclosureSection;
};

export const buildDisclosureDocumentsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let DisclosureDocument: SummarySection = null;

  DisclosureDocument = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.DISCLOSURE.DOCUMENT_FOR_DISCLOSURE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  DisclosureDocument.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.DISCLOSURE.DOCUMENT_TYPE', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, { lng: getLng(lang) }), uploadDocumentsHref, changeLabel(lang)));
  DisclosureDocument.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.DISCLOSURE.DATE_DOCUMENT', { lng: getLng(lang) }), t(`${claim.respondent1.responseType}`, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));
  DisclosureDocument.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return DisclosureDocument;
};

export const buildDisclosureListSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  let DisclosureListSection: SummarySection = null;

  DisclosureListSection = summarySection({
    title: t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.DISCLOSURE.DISCLOSURE_LIST', {lng: getLng(lang)}),
    summaryRows: [],
  });

  //TODO: Once implemented, change the value from claim.respondent1.responseType to the relevant value.
  DisclosureListSection.summaryList.rows.push(summaryRow(t('PAGES.EVIDENCE_UPLOAD.CHECK_YOUR_ANSWERS.FILE_UPLOADED', { lng: getLng(lang) }), t(claim.respondent1.responseType, {lng: getLng(lang)}), uploadDocumentsHref, changeLabel(lang)));

  return DisclosureListSection;
};
