import {AppRequest} from 'models/AppRequest';
import {SummarySection} from 'models/summaryList/summarySections';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {GenericForm} from 'form/models/genericForm';
import {t} from 'i18next';
import {
  translateErrors,
} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {
  CASE_DOCUMENT_VIEW_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {getCancelUrl, getClaimDetailsById} from 'services/features/generalApplication/generalApplicationService';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {documentIdExtractor} from 'common/utils/stringUtils';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

export const uploadSelectedFile = async (req: AppRequest, summarySection: SummarySection, claimId: string, gaId: string): Promise<void> => {
  try {
    const uploadDocument = new UploadGAFiles();
    const redisKey = generateRedisKey(req);
    const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
    uploadDocument.fileUpload = fileUpload;
    const form = new GenericForm(uploadDocument);
    form.validateSync();
    if (!form.hasErrors()) {
      uploadDocument.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
      await saveDocuments(req, redisKey, uploadDocument);
      await getSummaryList(summarySection, redisKey, claimId, gaId);
    } else {
      const errors = translateErrors(form.getAllErrors(), t);
      req.session.fileUpload = JSON.stringify(errors);
    }
  } catch(error) {
    logger.error(error);
    throw error;
  }
};

export const saveDocuments = async (req: AppRequest, redisKey: string, uploadDocument: UploadGAFiles): Promise<void> => {
  try {
    const claim = await getClaimDetailsById(req);
    claim.generalApplication.generalAppDirOrderUpload.push(uploadDocument);
    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getDirectionOrderDocumentUrl = (claimId: string, applicationResponse: ApplicationResponse): string => {
  const directionOrderDocument = applicationResponse.case_data?.directionOrderDocument;
  const documentId = documentIdExtractor(directionOrderDocument?.slice()?.reverse()
    ?.find(doc => doc.value?.documentType === 'DIRECTION_ORDER')?.value?.documentLink?.document_binary_url);
  return CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentId);
}

export const getSummaryList = async (formattedSummary: SummarySection, redisKey: string, claimId: string, gaId: string): Promise<void> => {
  const claim = await getCaseDataFromStore(redisKey);
  let index = 0;
  claim?.generalApplication?.generalAppDirOrderUpload?.forEach((uploadDocument: UploadGAFiles) => {
    index= index+ 1;
    formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL+'?id='+index), 'Remove document'));
  });
};

export const removeSelectedDocument = async (redisKey: string, index: number) : Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(redisKey, true);
    claim?.generalApplication?.generalAppDirOrderUpload?.splice(index, 1);
    await saveDraftClaim(redisKey, claim);
  } catch(error) {
    logger.error(error);
    throw error;
  }
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

export const translateCUItoCCD = (uploadDocumentsList: UploadGAFiles[]) => {
  return uploadDocumentsList?.map(uploadDocument => {
    return {
      value: {
        document_url: uploadDocument?.caseDocument?.documentLink?.document_url,
        document_binary_url: uploadDocument?.caseDocument?.documentLink?.document_url,
        document_filename: uploadDocument?.caseDocument?.documentLink?.document_filename,
        category_id: uploadDocument?.caseDocument?.documentLink?.category_id,
      },
    };
  });
};

export const getConfirmationContent = (async (claimId: string, claim: Claim, lng: string) => {

  return new PageSectionBuilder()
    .addTitle('PAGES.GENERAL_APPLICATION.UPLOAD_DIRECTIONS_ORDER_DOCUMENTS.CONFIRMATION_WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_DIRECTIONS_ORDER_DOCUMENTS.CONFIRMATION_WHAT_HAPPENS_NEXT_MSG')
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD', {lng}), await getCancelUrl(claimId, claim))
    .build();
});
