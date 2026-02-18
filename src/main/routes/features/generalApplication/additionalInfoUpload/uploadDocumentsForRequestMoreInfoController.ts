import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {getSummaryList} from 'services/features/generalApplication/additionalInfoUpload/uploadDocumentsForReqMoreInfoService';
import {getGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';
import {
  removeSelectedDocument,
  uploadSelectedFile,
} from 'services/features/generalApplication/documentUpload/uploadDocumentsService';
import {
  createMulterErrorMiddlewareForSingleField,
  createUploadOneFileError,
  getFileUploadErrorsForSource,
  FILE_UPLOAD_SOURCE,
} from 'common/utils/fileUploadUtils';
import {redirectIfMulterError} from 'services/features/generalApplication/uploadEvidenceDocumentService';

const uploadDocumentsForRequestMoreInfoController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/upload-documents';
const multerMiddleware = createMulterErrorMiddlewareForSingleField('selectedFile', 'uploadDocumentsForRequestMoreInfoController');

async function renderView(form: GenericForm<UploadGAFiles>, claim: Claim, claimId: string, gaId: string, res: Response, formattedSummary: SummarySection): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL);
  const backLinkUrl = BACK_URL;
  res.render(viewPath, {
    form,
    formattedSummary,
    cancelUrl,
    backLinkUrl,
    headerTitle: 'PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.PAGE_TITLE_TO_UPLOAD',
    currentUrl,
  });
}

uploadDocumentsForRequestMoreInfoController.get(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id:claimId } =
      req.params;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKeyForGA(req);
    const uploadDocuments = new UploadGAFiles();
    let form = new GenericForm(uploadDocuments);
    const formattedSummary = summarySection({title: '', summaryRows: []});

    const fileUploadErrors = getFileUploadErrorsForSource(req, FILE_UPLOAD_SOURCE.GA_ADDITIONAL_INFO);
    if (fileUploadErrors?.length) {
      form = new GenericForm(uploadDocuments, fileUploadErrors);
    }
    if (req.query?.id) {
      await removeSelectedDocument(redisKey, Number(req.query.id) - 1);
      const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL);
      const redirectUrl = req.query?.lang ? `${currentUrl}?lang=${req.query.lang}` : currentUrl;
      return res.redirect(redirectUrl);
    }
    await getSummaryList(formattedSummary, redisKey, claimId, appId);
    await renderView(form, claim, claimId, appId, res, formattedSummary);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadDocumentsForRequestMoreInfoController.post(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL, multerMiddleware, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id:claimId } = req.params;
    const uploadedDocuments = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL);

    if (redirectIfMulterError(req, res, currentUrl, FILE_UPLOAD_SOURCE.GA_ADDITIONAL_INFO)) {
      return;
    }

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req, FILE_UPLOAD_SOURCE.GA_ADDITIONAL_INFO);
      return res.redirect(`${currentUrl}`);
    }
    const uploadDoc = new UploadGAFiles();
    const form = new GenericForm(uploadDoc);
    form.validateSync();
    if (form.hasFieldError('fileUpload') && uploadedDocuments?.length === 0) {
      req.session.fileUpload = JSON.stringify(createUploadOneFileError());
      req.session.fileUploadSource = FILE_UPLOAD_SOURCE.GA_ADDITIONAL_INFO;
      return res.redirect(`${currentUrl}`);
    } else {
      res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId,  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsForRequestMoreInfoController;
