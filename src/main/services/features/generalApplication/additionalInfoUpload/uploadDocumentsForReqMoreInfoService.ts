import {SummarySection} from 'models/summaryList/summarySections';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {t} from 'i18next';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {
  GA_RESPOND_ADDITIONAL_INFO_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {
  getGADocumentsFromDraftStore,
} from 'modules/draft-store/draftGADocumentService';

export const getSummaryList = async (formattedSummary: SummarySection, redisKey: string, claimId: string, gaId: string): Promise<void> => {
  const uploadedDocuments = await getGADocumentsFromDraftStore(redisKey);
  let index = 0;
  uploadedDocuments.forEach((uploadDocument: UploadGAFiles) => {
    index= index+ 1;
    formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL+'?id='+index), 'Remove document'));
  });
};

export const buildSummarySection = (additionalText: string, uploadDocumentsList: UploadGAFiles[], claimId: string, appId: string, lng: any) => {

  const rows: SummaryRow[] = [];
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  if (additionalText.length > 0) {
    const rowValue = `${additionalText}`;
    rows.push(summaryRow(t('PAGES.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.TITLE', {lng}), rowValue, constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL), changeLabel()));
  }
  if (uploadDocumentsList.length > 0) {
    let rowValueDoc: string;
    rowValueDoc = '<ul class="no-list-style">';
    uploadDocumentsList.forEach(doc => {
      rowValueDoc += `<li>${doc.caseDocument.documentName}</li>`;
    });
    rowValueDoc += '</ul>';
    rows.push(summaryRow(t('PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.UPLOAD_DOC_CYA_TITLE', {lng}), rowValueDoc, constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL), changeLabel()));
  }
  return rows;
};

export const getConfirmationContent = (async (claimId: string, claim: Claim, lng: string) => {

  return new PageSectionBuilder()
    .addTitle('PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.CONFIRMATION_WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.CONFIRMATION_WHAT_HAPPENS_NEXT_MSG')
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD', {lng}), await getCancelUrl(claimId, claim))
    .build();
});