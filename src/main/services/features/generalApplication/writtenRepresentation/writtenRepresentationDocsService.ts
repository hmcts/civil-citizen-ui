import { UploadGAFiles } from 'common/models/generalApplication/uploadGAFiles';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { SummarySection } from 'common/models/summaryList/summarySections';
import { t } from 'i18next';
import { getGADocumentsFromDraftStore } from 'modules/draft-store/draftGADocumentService';
import {GA_PROVIDE_MORE_INFORMATION_URL, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';

export const getSummaryList = async (formattedSummary: SummarySection, redisKey: string, url: string): Promise<void> => {
  const uploadedDocuments = await getGADocumentsFromDraftStore(redisKey);
  let index = 0;
  uploadedDocuments.forEach((uploadDocument: UploadGAFiles) => {
    index = index + 1;
    formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', `${url}?id=${index}`, 'Remove document'));
  });
};

export const buildSummarySection = (writtenRepText: string, uploadDocumentsList: UploadGAFiles[], claimId: string, appId: string, lng: any) => {
  const rows: SummaryRow[] = [];
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', { lng });
  if (writtenRepText.length > 0) {
    const rowValue = `${writtenRepText}`;
    rows.push(summaryRow(t('PAGES.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.TITLE', {lng}), rowValue, constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_PROVIDE_MORE_INFORMATION_URL), changeLabel()));
  }
  if (uploadDocumentsList.length > 0) {
    let rowValueDoc: string;
    rowValueDoc = '<ul class="no-list-style">';
    uploadDocumentsList.forEach(doc => {
      rowValueDoc += `<li>${doc.caseDocument.documentName}</li>`;
    });
    rowValueDoc += '</ul>';
    rows.push(summaryRow(t('PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.UPLOAD_DOC_CYA_TITLE', {lng}), rowValueDoc, constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL), changeLabel()));
  }
  return rows;
};
