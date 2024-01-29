import {SummarySection, SummarySections} from 'models/summaryList/summarySections';
import {SummaryList, SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {CP_UPLOAD_DOCUMENTS_URL,} from 'routes/urls';
import {
  TypeOfDocumentSection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {formatStringDateSlash} from 'common/utils/dateUtils';
import {
  buildTitledSummaryRowValue,
} from 'services/features/caseProgression/checkYourAnswers/titledSummaryRowValueBuilder';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });
const getDate = (date: string): string => formatStringDateSlash(date);
const documentUploaded = (lang: string | unknown): string => t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_DOCUMENT_UPLOADED', {lng: getLng(lang)});

export const getMediationSummarySection = (uploadedDocuments: UploadDocuments, claimId: string, lang: string | unknown): SummarySections => {
  const mediationSection = {} as SummarySections;
  mediationSection.sections = [] as SummarySection[];
  const mediationSummarySection = {} as SummarySection;
  mediationSummarySection.summaryList = {} as SummaryList;
  mediationSummarySection.summaryList.rows = [] as SummaryRow[];

  const yourStatement = uploadedDocuments.typeOfDocuments.find(document => document.type === TypeOfMediationDocuments.YOUR_STATEMENT);
  if(yourStatement)
  {
    getMediationSummaryRows('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT', 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT',yourStatement.uploadDocuments, mediationSummarySection.summaryList, claimId, lang);
  }

  const documentsReferred = uploadedDocuments.typeOfDocuments.find(document => document.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT);
  if(documentsReferred)
  {
    getMediationSummaryRows('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY', 'PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', documentsReferred.uploadDocuments, mediationSummarySection.summaryList, claimId, lang);
  }

  if(mediationSummarySection.summaryList.rows.length > 0)
  {
    mediationSection.sections.push(mediationSummarySection);
  }

  return mediationSection;
};

const getMediationSummaryRows = (title: string, dateTitle: string,  documents: TypeOfDocumentSection[], summaryList: SummaryList, claimId: string, lang: string | unknown) => {

  let index = 1;
  for(const document of documents) {

    const uploadDocumentsHref = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
    let witnessSummaryRow = {} as SummaryRow;

    const witnessNameElement = {title: t('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', {lng: getLng(lang)}), value: document.caseDocument.documentName};
    const dateElement = {
      title: t(dateTitle, {lng: getLng(lang)}),
      value: getDate(document.dateInputFields.date.toString()),
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
