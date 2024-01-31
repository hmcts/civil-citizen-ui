import {SummarySection, SummarySections} from 'models/summaryList/summarySections';
import {SummaryList, SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {MEDIATION_UPLOAD_DOCUMENTS} from 'routes/urls';
import {
  TypeOfDocumentSection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {formatStringDateSlash} from 'common/utils/dateUtils';
import {
  buildTitledSummaryRowValue,
} from 'services/features/caseProgression/checkYourAnswers/titledSummaryRowValueBuilder';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {TypeOfDocumentYourNameSection} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });
const getDate = (date: string): string => formatStringDateSlash(date);
const documentUploaded = (lang: string | unknown): string => t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_DOCUMENT_UPLOADED', {lng: getLng(lang)});

const MEDIATION_PAGE = 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.';

export const getMediationSummarySection = (uploadedDocuments: UploadDocuments, claimId: string, lang: string | unknown): SummarySections => {
  const mediationSection = {} as SummarySections;
  mediationSection.sections = [] as SummarySection[];
  const mediationSummarySection = {} as SummarySection;
  mediationSummarySection.summaryList = {} as SummaryList;
  mediationSummarySection.summaryList.rows = [] as SummaryRow[];

  const yourStatement = uploadedDocuments.typeOfDocuments.find(document => document.type === TypeOfMediationDocuments.YOUR_STATEMENT);
  if(yourStatement)
  {
    getMediationYourNameSummaryRows(`${MEDIATION_PAGE}TITLE.${TypeOfMediationDocuments.YOUR_STATEMENT}`, `${MEDIATION_PAGE}YOUR_NAME.${TypeOfMediationDocuments.YOUR_STATEMENT}`,`${MEDIATION_PAGE}DATE_INPUT.${TypeOfMediationDocuments.YOUR_STATEMENT}`,yourStatement.uploadDocuments as TypeOfDocumentYourNameSection[], mediationSummarySection.summaryList, claimId, lang);
  }

  const documentsReferred = uploadedDocuments.typeOfDocuments.find(document => document.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT);
  if(documentsReferred)
  {
    getMediationDocumentReferredSummaryRows(`${MEDIATION_PAGE}TITLE.${TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT}`, `${MEDIATION_PAGE}YOUR_NAME.${TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT}`,`${MEDIATION_PAGE}DATE_INPUT.${TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT}`,documentsReferred.uploadDocuments as TypeOfDocumentSection[], mediationSummarySection.summaryList, claimId, lang);
  }

  if(mediationSummarySection.summaryList.rows.length > 0)
  {
    mediationSection.sections.push(mediationSummarySection);
  }

  return mediationSection;
};

const getMediationDocumentReferredSummaryRows = (title: string, nameStatement: string, dateTitle: string,  documents: TypeOfDocumentSection[] , summaryList: SummaryList, claimId: string, lang: string | unknown) => {

  let index = 1;
  for(const document of documents) {

    const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS);
    let documentReferredSummaryRow = {} as SummaryRow;

    const documentReferredNameElement = {title: t(nameStatement, {lng: getLng(lang)}), value: document.typeOfDocument};

    const dateElement = {
      title: t(dateTitle, {lng: getLng(lang)}),
      value: getDate(document.dateInputFields.date.toString()),
    };
    const documentElement = {title: documentUploaded(lang), value: formatDocumentViewURL(document.caseDocument.documentName, claimId, document.caseDocument.documentLink.document_binary_url)};

    let sectionTitle = t(title, { lng: getLng(lang) });
    sectionTitle = documents.length > 1 ? sectionTitle +' '+ index : sectionTitle;
    index++;
    const sectionValueList = [documentReferredNameElement, dateElement, documentElement];
    const sectionValue = buildTitledSummaryRowValue(sectionValueList);

    documentReferredSummaryRow = summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel(lang));

    summaryList.rows.push(documentReferredSummaryRow);
  }
};

const getMediationYourNameSummaryRows = (title: string, nameStatement: string, dateTitle: string,  documents: TypeOfDocumentYourNameSection[], summaryList: SummaryList, claimId: string, lang: string | unknown) => {

  let index = 1;
  for(const document of documents) {

    const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS);
    let yourNameSummaryRow = {} as SummaryRow;

    const  yourNameElement = {title: t(nameStatement, {lng: getLng(lang)}), value: document.yourName};

    const dateElement = {
      title: t(dateTitle, {lng: getLng(lang)}),
      value: getDate(document.dateInputFields.date.toString()),
    };
    const documentElement = {title: documentUploaded(lang), value: formatDocumentViewURL(document.caseDocument.documentName, claimId, document.caseDocument.documentLink.document_binary_url)};

    let sectionTitle = t(title, { lng: getLng(lang) });
    sectionTitle = documents.length > 1 ? sectionTitle +' '+ index : sectionTitle;
    index++;
    const sectionValueList = [yourNameElement, dateElement, documentElement];
    const sectionValue = buildTitledSummaryRowValue(sectionValueList);

    yourNameSummaryRow = summaryRow(sectionTitle, sectionValue.html, uploadDocumentsHref, changeLabel(lang));

    summaryList.rows.push(yourNameSummaryRow);
  }
};
