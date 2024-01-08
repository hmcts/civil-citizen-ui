import {summaryRow} from 'models/summaryList/summaryList';
import {
  buildTitledSummaryRowValue,
} from 'services/features/caseProgression/checkYourAnswers/titledSummaryRowValueBuilder';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CP_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });
const documentTitle = 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_DOCUMENT_UPLOADED';
export const mockNameValue = 'John Smith';
export const mockDocumentNameValue = 'document type';
export const mockDateValue = '12/12/2022';

export const mockExpertiseValue = 'expertise';
export const mockDocumentValue = '<a class="govuk-link" target="_blank" href="/case/1234/view-documents/test">test.png</a>';

export const getWitnessEvidenceSummaryRow = (title: string, dateTitle: string, claimId: string) => {
  const sectionTitle = title;
  const witnessName = {title: 'PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', value: mockNameValue};
  const witnessDate = {title: dateTitle, value: mockDateValue};
  const witnessDocument = {title: documentTitle, value: mockDocumentValue};

  const sectionValueList = [witnessName, witnessDate, witnessDocument];
  const sectionValue = buildTitledSummaryRowValue(sectionValueList);

  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);

  return summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel('en'));
};

export const getExpertEvidenceSummaryRow = (title: string, expertTitle: string, dateTitle: string, claimId: string) => {
  const sectionTitle = title;
  const expertName = {title: expertTitle, value: mockNameValue};
  const expertiseName = {title: 'PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', value: mockExpertiseValue};
  const expertDate = {title: dateTitle, value: mockDateValue};
  const expertDocument = {title: documentTitle, value: mockDocumentValue};

  const sectionValueList = [expertName, expertiseName, expertDate, expertDocument];
  const sectionValue = buildTitledSummaryRowValue(sectionValueList);

  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);

  return summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel('en'));
};

export const getExpertOtherPartySummaryRow = (title: string, otherPartyTitle: string, claimId: string) => {
  const sectionTitle = title;
  const expertName = {title: 'PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', value: mockNameValue};
  const otherPartyName = {title: 'PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', value: mockNameValue};
  const otherPartyDocument = {title: otherPartyTitle, value: 'other party document'};
  const expertDocument = {title: documentTitle, value: mockDocumentValue};

  const sectionValueList = [expertName, otherPartyName, otherPartyDocument, expertDocument];
  const sectionValue = buildTitledSummaryRowValue(sectionValueList);

  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);

  return summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel('en'));
};

export const getDocumentTypeSummaryRow = (title: string, claimId: string) => {
  const sectionTitle = title;
  const documentType = {title: 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', value: mockDocumentNameValue};
  const documentDate = {title: 'PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', value: mockDateValue};
  const document = {title: documentTitle, value: mockDocumentValue};

  const sectionValueList = [documentType, documentDate, document];
  const sectionValue = buildTitledSummaryRowValue(sectionValueList);

  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);

  return summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel('en'));
};

export const getDocumentReferredToSummaryRow = (title: string, claimId: string) => {
  const sectionTitle = title;
  const witnessName = {title: 'PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', value: mockNameValue};
  const documentType = {title: 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', value: mockDocumentNameValue};
  const documentDate = {title: 'PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', value: mockDateValue};
  const document = {title: documentTitle, value: mockDocumentValue};

  const sectionValueList = [witnessName, documentType, documentDate, document];
  const sectionValue = buildTitledSummaryRowValue(sectionValueList);

  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);

  return summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel('en'));
};

export const getFileOnlySummaryRow = (title: string, claimId: string) => {
  const sectionTitle = title;
  const document = {title: documentTitle, value: mockDocumentValue};

  const sectionValueList = [document];
  const sectionValue = buildTitledSummaryRowValue(sectionValueList);

  const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);

  return summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel('en'));
};
