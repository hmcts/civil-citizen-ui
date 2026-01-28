import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CYA_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {
  getApplicationFromGAService,
  getCancelUrl,
} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {
  getDirectionOrderDocumentUrl,
  getSummaryList,
} from 'services/features/generalApplication/directionsOrderUpload/uploadDocumentsDirectionsOrderService';
import {getGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';
import {
  removeSelectedDocument,
  uploadSelectedFile,
} from 'services/features/generalApplication/documentUpload/uploadDocumentsService';
import {
  createMulterErrorMiddlewareForSingleField,
  createUploadOneFileError,
  getMulterErrorConstraint,
} from 'common/utils/fileUploadUtils';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';
import {translateErrors} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {t} from 'i18next';

const uploadDocumentsDirectionsOrderController = Router();
const viewPath = 'features/generalApplication/directionsOrderUpload/upload-documents';
const multerMiddleware = createMulterErrorMiddlewareForSingleField('selectedFile', 'uploadDocumentsDirectionsOrderController');

async function renderView(form: GenericForm<UploadGAFiles>, claim: Claim, claimId: string, gaId: string, req: AppRequest, res: Response, formattedSummary: SummarySection): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL);
  const backLinkUrl = BACK_URL;
  const applicationResponse = await getApplicationFromGAService(req, gaId);
  const directionOrderDocUrl = getDirectionOrderDocumentUrl(claimId, applicationResponse);
  res.render(viewPath, {
    form,
    formattedSummary,
    cancelUrl,
    backLinkUrl,
    directionOrderDocUrl,
    headerTitle: 'PAGES.GENERAL_APPLICATION.UPLOAD_DIRECTIONS_ORDER_DOCUMENTS.PAGE_TITLE',
    currentUrl,
  });
}

uploadDocumentsDirectionsOrderController.get(GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id:claimId } = req.params;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKeyForGA(req);
    const uploadDocuments = new UploadGAFiles();
    let form = new GenericForm(uploadDocuments);
    const formattedSummary = summarySection({title: '', summaryRows: []});
    if (req?.session?.fileUpload) {
      const parsedData = JSON.parse(req?.session?.fileUpload);
      form = new GenericForm(uploadDocuments, parsedData);
      req.session.fileUpload = undefined;
    }
    if (req.query?.id) {
      const index = req.query.id;
      await removeSelectedDocument(redisKey, Number(index)-1);
    }
    await getSummaryList(formattedSummary, redisKey, claimId, appId);
    await renderView(form, claim, claimId, appId, req, res, formattedSummary);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadDocumentsDirectionsOrderController.post(GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL, multerMiddleware, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id:claimId } = req.params;
    const uploadedDocuments = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL);

    if ((req as any).multerError && req.body.action === 'uploadButton') {
      const multerError = (req as any).multerError;
      const errorConstraint = getMulterErrorConstraint(multerError);
      const errorStructure: FormValidationError[] = [
        new FormValidationError({
          target: { fileUpload: '' },
          property: 'fileUpload',
          constraints: { multerError: errorConstraint },
        }),
      ];
      const translatedErrors = translateErrors(errorStructure, t);
      req.session.fileUpload = JSON.stringify(translatedErrors);
      return res.redirect(`${currentUrl}`);
    }

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req);
      return res.redirect(`${currentUrl}`);
    }
    const uploadDoc = new UploadGAFiles();
    const form = new GenericForm(uploadDoc);
    form.validateSync();
    if (form.hasFieldError('fileUpload') && uploadedDocuments?.length === 0) {
      req.session.fileUpload = JSON.stringify(createUploadOneFileError());
      return res.redirect(`${currentUrl}`);
    } else {
      res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId,  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CYA_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsDirectionsOrderController;
