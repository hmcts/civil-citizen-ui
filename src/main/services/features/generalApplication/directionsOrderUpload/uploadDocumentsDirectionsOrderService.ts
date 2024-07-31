import {SummarySection} from 'models/summaryList/summarySections';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {t} from 'i18next';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {
  CASE_DOCUMENT_VIEW_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {getGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';

export const getDirectionOrderDocumentUrl = (claimId: string, applicationResponse: ApplicationResponse): string => {
  const directionOrderDocument = applicationResponse?.case_data?.directionOrderDocument;
  const documentId = documentIdExtractor(directionOrderDocument?.slice()?.reverse()
    ?.find(doc => doc.value?.documentType === 'DIRECTION_ORDER')?.value?.documentLink?.document_binary_url);
  return CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentId);
};

export const getSummaryList = async (formattedSummary: SummarySection, redisKey: string, claimId: string, gaId: string): Promise<void> => {
  const uploadedDocuments = await getGADocumentsFromDraftStore(redisKey);
  let index = 0;
  uploadedDocuments?.forEach((uploadDocument: UploadGAFiles) => {
    index= index+ 1;
    formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL+'?id='+index), 'Remove document'));
  });
};

export const buildSummarySection = (uploadDocumentsList: UploadGAFiles[], claimId: string, appId: string, lng: any) => {
  let rowValue: string;
  const rows: SummaryRow[] = [];
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  rowValue = '<ul class="no-list-style">';
  uploadDocumentsList.forEach(doc => {
    rowValue += `<li>${doc.caseDocument.documentName}</li>`;
  });
  rowValue += '</ul>';
  rows.push(summaryRow(t('PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.UPLOAD_DOC_CYA_TITLE', {lng}), rowValue , constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL), changeLabel()));
  return rows;
};

export const getConfirmationContent = (async (claimId: string, claim: Claim, lng: string) => {

  return new PageSectionBuilder()
    .addTitle('PAGES.GENERAL_APPLICATION.UPLOAD_DIRECTIONS_ORDER_DOCUMENTS.CONFIRMATION_WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_DIRECTIONS_ORDER_DOCUMENTS.CONFIRMATION_WHAT_HAPPENS_NEXT_MSG')
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD', {lng}), await getCancelUrl(claimId, claim))
    .build();
});
