import { NextFunction, RequestHandler, Response, Router } from 'express';
import {
  BACK_URL,
  GA_UPLOAD_N245_FORM_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import {Claim} from 'models/claim';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { getCancelUrl, saveN245Form } from 'services/features/generalApplication/generalApplicationService';
import { UploadGAFiles } from 'common/models/generalApplication/uploadGAFiles';
import { getUploadFormContent, uploadSelectedFile } from 'services/features/generalApplication/uploadN245FormService';
import {uploadN245FormControllerGuard} from 'routes/guards/generalApplication/uploadN245FormControllerGuard';
import {UploadN245GAFiles} from 'models/generalApplication/uploadN245GAFiles';
import { createMulterErrorMiddlewareForSingleField, getFileUploadErrorsForSource, FILE_UPLOAD_SOURCE } from 'common/utils/fileUploadUtils';
import { redirectIfMulterError } from 'services/features/generalApplication/uploadEvidenceDocumentService';

const uploadN245FormController = Router();
const viewPath = 'features/generalApplication/upload-n245-form';
const removeDoc = 'REMOVE_DOC';
const selectedFile = 'selectedFile';
const uploadButton = 'uploadButton';
const pageTitle = 'PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.PAGE_TITLE';
const multerMiddleware = createMulterErrorMiddlewareForSingleField(selectedFile, 'uploadN245FormController');

uploadN245FormController.get(GA_UPLOAD_N245_FORM_URL, uploadN245FormControllerGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const contentList = getUploadFormContent(lng);
    const redisKey = generateRedisKey(<AppRequest>req);
    const uploadedN245Details = claim.generalApplication?.uploadN245Form || new UploadGAFiles();
    let documentName = uploadedN245Details.caseDocument?.documentName;
    const cancelUrl = await getCancelUrl(claimId, claim);
    let form = new GenericForm(uploadedN245Details);
    const fileUploadErrors = getFileUploadErrorsForSource(req, FILE_UPLOAD_SOURCE.GA_UPLOAD_N245);
    if (fileUploadErrors?.length) {
      form = new GenericForm(uploadedN245Details, fileUploadErrors);
    }
    const currentUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL);
    const backLinkUrl = BACK_URL;
    if (req.query?.action === removeDoc) {
      saveN245Form(redisKey, claim, undefined);
      documentName = undefined;
    }
    res.render(viewPath, {
      currentUrl,
      form,
      documentName,
      cancelUrl,
      backLinkUrl,
      contentList,
      pageTitle,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadN245FormController.post(GA_UPLOAD_N245_FORM_URL, multerMiddleware, uploadN245FormControllerGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const currentUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL);
    const redisKey = generateRedisKey(req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const contentList = getUploadFormContent(lng);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = BACK_URL;

    if (redirectIfMulterError(req, res, currentUrl, FILE_UPLOAD_SOURCE.GA_UPLOAD_N245)) {
      return;
    }

    if (req.body.action === uploadButton) {
      const { form, documentName } = await uploadSelectedFile(req, claim);
      return res.render(viewPath, {
        currentUrl,
        documentName,
        form,
        claimId,
        cancelUrl,
        backLinkUrl,
        contentList,
        pageTitle,
      });
    }
    const uploadedN245Details = claim.generalApplication?.uploadN245Form || new UploadGAFiles();
    const uploadedN245: UploadN245GAFiles = new UploadN245GAFiles(uploadedN245Details);
    const form = new GenericForm(uploadedN245);
    form.validateSync();
    if (form.hasErrors()) {
      return res.render(viewPath, {
        currentUrl,
        form,
        claimId,
        cancelUrl,
        backLinkUrl,
        contentList,
      });
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadN245FormController;
