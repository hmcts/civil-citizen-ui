import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, GA_VIEW_APPLICATION_URL } from 'routes/urls';
import multer from 'multer';
import { UploadAdditionalDocument } from 'common/models/generalApplication/UploadAdditionalDocument';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { getClaimDetailsById, getSummaryList, removeSelectedDocument, uploadSelectedFile } from 'services/features/generalApplication/additionalDocumentService';

const uploadAdditionalDocumentsController = Router();

const viewPath = 'features/generalApplication/additionalDocuments/upload-additional-documents';
const fileSize = Infinity;
const upload = multer({
  limits: {
    fileSize: fileSize,
  },
});

uploadAdditionalDocumentsController.get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId:gaId, id } = req.params;
    const uploadedDocument = new UploadAdditionalDocument();
    let form = new GenericForm(uploadedDocument);
    const redisKey = generateRedisKey(req);
    const claim = await getClaimDetailsById(req);
    const gaDetails = claim.generalApplication;

    if (req.session?.fileUpload) {
      const parsedData = JSON.parse(req?.session?.fileUpload);
      form = new GenericForm(uploadedDocument, parsedData);
      req.session.fileUpload = undefined;
    }
    if (req.query?.indexId) {
      const index = req.query.indexId;
      await removeSelectedDocument(redisKey, claim, Number(index) - 1);
    }
    const cancelUrl = await getCancelUrl(id, claim);
    const backLinkUrl = `${constructResponseUrlWithIdParams(id, GA_VIEW_APPLICATION_URL)}?applicationId=${gaId}`;
    const formattedSummary = getSummaryList(gaDetails.uploadAdditionalDocuments, id, gaId);
    res.render(viewPath, { cancelUrl, backLinkUrl, form, formattedSummary });
  } catch (err) {
    next(err);
  }
}) as RequestHandler);

uploadAdditionalDocumentsController.post(GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, upload.single('selectedFile'), (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL);
    const claim = await getClaimDetailsById(req);
    const gaDetails = claim.generalApplication;
    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req, claim);
      return res.redirect(`${currentUrl}`);
    }
    if (gaDetails.uploadAdditionalDocuments.length === 0) {
      const errors = [{
        target: {
          fileUpload: '',
          typeOfDocument: '',
        },
        value: '',
        property: '',

        constraints: {
          isNotEmpty: 'ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE',
        },
      }];
      req.session.fileUpload = JSON.stringify(errors);
      return res.redirect(`${currentUrl}`);
    }
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL));
  } catch (err) {
    next(err);
  }
}));

export default uploadAdditionalDocumentsController;