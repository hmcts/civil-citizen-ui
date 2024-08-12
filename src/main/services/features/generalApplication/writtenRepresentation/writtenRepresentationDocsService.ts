import { UploadGAFiles } from 'common/models/generalApplication/uploadGAFiles';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { SummarySection } from 'common/models/summaryList/summarySections';
import { t } from 'i18next';
import { getGADocumentsFromDraftStore } from 'modules/draft-store/draftGADocumentService';

export const getSummaryList = async (formattedSummary: SummarySection, redisKey: string, url: string): Promise<void> => {
  const uploadedDocuments = await getGADocumentsFromDraftStore(redisKey);
  let index = 0;
  uploadedDocuments.forEach((uploadDocument: UploadGAFiles) => {
    index = index + 1;
    formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', `${url}?id=${index}`, 'Remove document'));
  });
};

export const buildSummarySection = (uploadDocumentsList: UploadGAFiles[], url: string, lng: any) => {
  const rows: SummaryRow[] = [];
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', { lng });
  let rowValue = '<ul class="no-list-style">';
  uploadDocumentsList.forEach(doc => {
    rowValue += `<li>${doc.caseDocument.documentName}</li>`;
  });
  rowValue += '</ul>';
  rows.push(summaryRow(t('PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.UPLOAD_DOC_CYA_TITLE', { lng }), rowValue, url, changeLabel()));
  return rows;
};