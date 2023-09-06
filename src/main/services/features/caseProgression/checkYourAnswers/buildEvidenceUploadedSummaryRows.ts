import {SummarySection, SummarySections} from 'models/summaryList/summarySections';
import {
  SummaryList,
  SummaryRow,
  summaryRow,
  TitledSummaryRowElement,
} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  CP_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import {
  ExpertSection,
  FileOnlySection,
  TypeOfDocumentSection, UploadDocumentsUserForm,
  WitnessSection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {formatStringDateDMY} from 'common/utils/dateUtils';
import {
  buildTitledSummaryRowValue,
} from 'services/features/caseProgression/checkYourAnswers/titledSummaryRowValueBuilder';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });
const documentUploaded = (lang: string | unknown): string => t('PAGES.UPLOAD_DOCUMENTS.UPLOAD', {lng: getLng(lang)});

export const getWitnessSummarySection = (uploadedDocuments: UploadDocumentsUserForm, claimId: string, lang: string | unknown): SummarySections => {
  const witnessEvidenceSection = {} as SummarySections;
  witnessEvidenceSection.sections = [] as SummarySection[];
  const witnessSummarySection = {} as SummarySection;
  witnessSummarySection.summaryList = {} as SummaryList;
  witnessSummarySection.summaryList.rows = [] as SummaryRow[];

  const witnessSummary = uploadedDocuments.witnessSummary;
  witnessSummary != null ? getWitnessSummaryRows('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY', 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', witnessSummary, witnessSummarySection.summaryList, claimId, lang) : null;

  const witnessStatement = uploadedDocuments.witnessStatement;
  witnessStatement != null ? getWitnessSummaryRows('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT', 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT',witnessStatement, witnessSummarySection.summaryList, claimId, lang) : null;

  const noticeOfIntention = uploadedDocuments.noticeOfIntention;
  noticeOfIntention != null ? getWitnessSummaryRows('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE', 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', noticeOfIntention, witnessSummarySection.summaryList, claimId, lang) : null;

  const documentsReferred = uploadedDocuments.documentsReferred;
  documentsReferred != null ? getDocumentTypeSummaryRows('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT', documentsReferred, witnessSummarySection.summaryList, claimId, lang) : null;

  if(witnessSummarySection.summaryList.rows.length > 0)
  {
    witnessEvidenceSection.sections.push(witnessSummarySection);
  }

  return witnessEvidenceSection;
};

export const getExpertSummarySection = (uploadedDocuments: UploadDocumentsUserForm, claimId: string, lang: string | unknown): SummarySections => {
  const expertEvidenceSection = {} as SummarySections;
  expertEvidenceSection.sections = [] as SummarySection[];
  const expertSummarySection = {} as SummarySection;
  expertSummarySection.summaryList = {} as SummaryList;
  expertSummarySection.summaryList.rows = [] as SummaryRow[];

  const expertReport = uploadedDocuments.expertReport;
  expertReport != null ? getExpertSummaryRows('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.DATE_REPORT_WAS', expertReport, expertSummarySection.summaryList, claimId, lang) : null;

  const expertStatement = uploadedDocuments.expertStatement;
  expertReport != null ? getExpertSummaryRows('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERTS_NAMES', 'PAGES.UPLOAD_DOCUMENTS.DATE', expertStatement, expertSummarySection.summaryList, claimId, lang) : null;

  const questionsForExperts = uploadedDocuments.questionsForExperts;
  questionsForExperts != null ? getExpertOtherPartySummaryRows('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_YOU', true, questionsForExperts, expertSummarySection.summaryList, claimId, lang) : null;

  const answersForExperts = uploadedDocuments.answersForExperts;
  answersForExperts != null ? getExpertOtherPartySummaryRows( 'PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_WITH', false, answersForExperts, expertSummarySection.summaryList, claimId, lang) : null;

  if(expertSummarySection.summaryList.rows.length > 0){
    expertEvidenceSection.sections.push(expertSummarySection);
  }

  return expertEvidenceSection;
};

export const getDisclosureSummarySection = (uploadedDocuments: UploadDocumentsUserForm, claimId: string, lang: string | unknown): SummarySections => {
  const disclosureEvidenceSection = {} as SummarySections;
  disclosureEvidenceSection.sections = [] as SummarySection[];
  const disclosureSummarySection = {} as SummarySection;
  disclosureSummarySection.summaryList = {} as SummaryList;
  disclosureSummarySection.summaryList.rows = [] as SummaryRow[];

  const documentsForDisclosure = uploadedDocuments.documentsForDisclosure;
  documentsForDisclosure != null ? getDocumentTypeSummaryRows('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS', documentsForDisclosure, disclosureSummarySection.summaryList, claimId, lang) : null;

  const disclosureList = uploadedDocuments.disclosureList;
  disclosureList != null ? getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST', disclosureList, disclosureSummarySection.summaryList, claimId, lang) : null;

  if(disclosureSummarySection.summaryList.rows.length > 0) {
    disclosureEvidenceSection.sections.push(disclosureSummarySection);
  }

  return disclosureEvidenceSection;
};

export const getTrialSummarySection = (uploadedDocuments: UploadDocumentsUserForm, isSmallClaims: boolean, claimId: string, lang: string | unknown): SummarySections => {
  const trialEvidenceSection = {} as SummarySections;
  trialEvidenceSection.sections = [] as SummarySection[];
  const trialSummarySection = {} as SummarySection;
  trialSummarySection.summaryList = {} as SummaryList;
  trialSummarySection.summaryList.rows = [] as SummaryRow[];

  const trialCaseSummary = uploadedDocuments.trialCaseSummary;
  trialCaseSummary != null ?getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY', trialCaseSummary, trialSummarySection.summaryList, claimId, lang) : null;

  const trialSkeletonArgument = uploadedDocuments.trialSkeletonArgument;
  trialSkeletonArgument != null ? getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON', trialSkeletonArgument, trialSummarySection.summaryList, claimId, lang) : null;

  const trialAuthorities = uploadedDocuments.trialAuthorities;
  trialAuthorities != null ? getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL', trialAuthorities, trialSummarySection.summaryList, claimId, lang) : null;

  const trialCosts = uploadedDocuments.trialCosts;
  trialCosts != null ? getFileOnlySummaryRow('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS', trialCosts, trialSummarySection.summaryList, claimId, lang) : null;

  const trialDocumentary = uploadedDocuments.trialDocumentary;
  const hearingOrTrialTitle = isSmallClaims ? 'PAGES.UPLOAD_DOCUMENTS.HEARING.DOCUMENTARY' : 'PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY';
  trialDocumentary != null ? getDocumentTypeSummaryRows(hearingOrTrialTitle, trialDocumentary, trialSummarySection.summaryList, claimId, lang) : null;

  if(trialSummarySection.summaryList.rows.length > 0){
    trialEvidenceSection.sections.push(trialSummarySection);
  }

  return trialEvidenceSection;
};

const getWitnessSummaryRows = (title: string, dateTitle: string,  documents: WitnessSection[], summaryList: SummaryList, claimId: string, lang: string | unknown) => {

  let index = 1;
  for(const document of documents) {

    const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
    let witnessSummaryRow = {} as SummaryRow;

    const witnessNameElement = {title: t('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', {lng: getLng(lang)}), value: document.witnessName};
    const dateElement = {
      title: t(dateTitle, {lng: getLng(lang)}),
      value: formatStringDateDMY(new Date(document.dateInputFields.date)),
    };
    const documentElement = {title: documentUploaded(lang), value: formatDocumentViewURL(document.caseDocument.documentName, claimId, document.caseDocument.documentLink.document_binary_url)};

    let sectionTitle = t(title, { lng: getLng(lang) });
    sectionTitle = documents.length > 1 ? sectionTitle +' '+ index : sectionTitle;
    index++;
    const sectionValueList = [witnessNameElement, dateElement, documentElement];
    const sectionValue = buildTitledSummaryRowValue(sectionValueList);

    witnessSummaryRow = summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel(lang));

    summaryList.rows.push(witnessSummaryRow);
  }
};

const getExpertSummaryRows = (title: string, expertTitle: string, dateTitle: string, documents: ExpertSection[], summaryList: SummaryList, claimId: string, lang: string | unknown) => {

  let index = 1;
  for(const document of documents) {

    const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
    let expertSummaryRow = {} as SummaryRow;

    const expertNameElement = {title: t(expertTitle, {lng: getLng(lang)}), value: document.expertName};
    const expertiseElement = {title: t('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', {lng: getLng(lang)}), value: document.fieldOfExpertise};
    const dateElement = {
      title: t(dateTitle, {lng: getLng(lang)}),
      value: formatStringDateDMY(new Date(document.dateInputFields.date)),
    };
    const documentElement = {title: documentUploaded(lang), value: formatDocumentViewURL(document.caseDocument.documentName, claimId, document.caseDocument.documentLink.document_binary_url)};

    let sectionTitle = t(title, { lng: getLng(lang) });
    sectionTitle = documents.length > 1 ? sectionTitle +' '+ index : sectionTitle;
    index++;
    const sectionValueList = [expertNameElement, expertiseElement, dateElement, documentElement];
    const sectionValue = buildTitledSummaryRowValue(sectionValueList);

    expertSummaryRow = summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel(lang));

    summaryList.rows.push(expertSummaryRow);
  }

};

const getDocumentTypeSummaryRows = (title: string, documents: TypeOfDocumentSection[], summaryList: SummaryList, claimId: string, lang: string | unknown) => {

  let index = 1;
  for(const document of documents) {
    const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
    let documentTypeSummaryRow = {} as SummaryRow;

    const typeOfDocumentElement = {title: t('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', {lng: getLng(lang)}), value: document.typeOfDocument};
    const dateElement = {title: t('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', {lng: getLng(lang)}), value: formatStringDateDMY(new Date(document.dateInputFields.date))};
    const documentElement = {title: documentUploaded(lang), value: formatDocumentViewURL(document.caseDocument.documentName, claimId, document.caseDocument.documentLink.document_binary_url)};

    let sectionTitle = t(title, { lng: getLng(lang) });
    sectionTitle = documents.length > 1 ? sectionTitle +' '+ index : sectionTitle;
    index++;
    const sectionValueList = [typeOfDocumentElement, dateElement, documentElement];
    const sectionValue = buildTitledSummaryRowValue(sectionValueList);

    documentTypeSummaryRow = summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel(lang));

    summaryList.rows.push(documentTypeSummaryRow);
  }
};

const getFileOnlySummaryRow = (title: string, documents: FileOnlySection[], summaryList: SummaryList, claimId: string, lang: string | unknown) => {

  let index = 1;
  for(const document of documents){
    const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
    let fileOnlySummaryRow = {} as SummaryRow;

    const documentUploadedElement = {title: documentUploaded(lang), value: formatDocumentViewURL(document.caseDocument.documentName, claimId, document.caseDocument.documentLink.document_binary_url)};

    let sectionTitle = t(title, { lng: getLng(lang) });
    sectionTitle = documents.length > 1 ? sectionTitle +' '+ index : sectionTitle;
    index++;
    const sectionValueList = [documentUploadedElement];
    const sectionValue = buildTitledSummaryRowValue(sectionValueList);

    fileOnlySummaryRow = summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel(lang));

    summaryList.rows.push(fileOnlySummaryRow);
  }
};

const getExpertOtherPartySummaryRows = (title: string, otherPartyTitle: string, isQuestion: boolean, documents: ExpertSection[], summaryList: SummaryList, claimId: string, lang: string | unknown) => {

  let index = 1;
  for(const document of documents){
    const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
    let expertQuestionsSummaryRow = {} as SummaryRow;
    const otherPartyDocumentName = isQuestion ? document.questionDocumentName : document.otherPartyQuestionsDocumentName;

    const expertNameElement: TitledSummaryRowElement = {title: t('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', { lng: getLng(lang) }), value: document.expertName};
    const otherPartyElement: TitledSummaryRowElement = {title: t('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', { lng: getLng(lang) }), value: document.otherPartyName};
    const otherPartyDocumentElement: TitledSummaryRowElement = {title: t(otherPartyTitle, {lng: getLng(lang)}), value: otherPartyDocumentName};
    const documentUploadedElement: TitledSummaryRowElement = {title:documentUploaded(lang), value: formatDocumentViewURL(document.caseDocument.documentName, claimId, document.caseDocument.documentLink.document_binary_url)};

    let sectionTitle = t(title, { lng: getLng(lang) });
    sectionTitle = documents.length > 1 ? sectionTitle +' '+ index : sectionTitle;
    index++;
    const sectionValueList = [expertNameElement, otherPartyElement, otherPartyDocumentElement, documentUploadedElement];
    const sectionValue = buildTitledSummaryRowValue(sectionValueList);

    expertQuestionsSummaryRow = summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel(lang));
    summaryList.rows.push(expertQuestionsSummaryRow);
  }
};
