import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import {
  BACK_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
} from 'routes/urls';
import { UploadAdditionalDocument } from 'common/models/generalApplication/UploadAdditionalDocument';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { getClaimDetailsById, getSummaryList, removeSelectedDocument, uploadSelectedFile } from 'services/features/generalApplication/additionalDocumentService';
import {
  createMulterErrorMiddlewareForMultipleFiles,
  createUploadOneFileError,
  getFileUploadErrorsForSource,
  FILE_UPLOAD_SOURCE,
} from 'common/utils/fileUploadUtils';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {handleMulterError} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {getDeleteFileIndex} from 'services/features/generalApplication/documentUpload/deleteUploadedGADocuments';

const uploadAdditionalDocumentsController = Router();

const viewPath = 'features/generalApplication/additionalDocuments/upload-additional-documents';
const multerMiddleware = createMulterErrorMiddlewareForMultipleFiles('selectedFile', 'uploadAdditionalDocumentsController');

uploadAdditionalDocumentsController.get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const gaId = getRouteParam(req, 'appId');
    const id = getRouteParam(req, 'id');
    const uploadedDocument = new UploadAdditionalDocument();
    let form = new GenericForm(uploadedDocument);
    const claim = await getClaimDetailsById(req);
    const gaDetails = claim.generalApplication;
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;

    const fileUploadErrors = getFileUploadErrorsForSource(req, FILE_UPLOAD_SOURCE.GA_ADDITIONAL_DOCUMENTS);
    if (fileUploadErrors?.length) {
      form = new GenericForm(uploadedDocument, fileUploadErrors);
    }
    const cancelUrl = await getCancelUrl(id, claim);
    const backLinkUrl = BACK_URL;
    const formattedSummary = getSummaryList(gaDetails.uploadAdditionalDocuments, id, gaId, lng);
    res.render(viewPath, { cancelUrl, backLinkUrl, form, formattedSummary });
  } catch (err) {
    next(err);
  }
}) as RequestHandler);

uploadAdditionalDocumentsController.post(GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, multerMiddleware, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const appId = getRouteParam(req, 'appId');
    const claimId = getRouteParam(req, 'id');
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL);
    const claim = await getClaimDetailsById(req);
    const gaDetails = claim.generalApplication;

    if (handleMulterError(req, FILE_UPLOAD_SOURCE.GA_ADDITIONAL_DOCUMENTS)) {
      return req.session.save(() => {
        res.redirect(`${currentUrl}`);
      });
    }

    const deleteFileIndex = getDeleteFileIndex(req.body.action);
    if (deleteFileIndex !== undefined) {
      await removeSelectedDocument(req, generateRedisKey(req), claim, deleteFileIndex, req.session.user?.id);
      return res.redirect(currentUrl);
    }

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req, claim);
      return req.session.save(() => {
        res.redirect(`${currentUrl}`);
      });
    }
    if (gaDetails.uploadAdditionalDocuments.length === 0) {
      req.session.fileUpload = JSON.stringify(createUploadOneFileError());
      req.session.fileUploadSource = FILE_UPLOAD_SOURCE.GA_ADDITIONAL_DOCUMENTS;
      return req.session.save(() => {
        res.redirect(`${currentUrl}`);
      });
    }
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL));
  } catch (err) {
    next(err);
  }
}));

export default uploadAdditionalDocumentsController;
