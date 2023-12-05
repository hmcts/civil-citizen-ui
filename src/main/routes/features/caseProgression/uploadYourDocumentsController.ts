import {NextFunction, RequestHandler, Router} from 'express';
import {UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {getUploadYourDocumentsContents} from 'services/features/caseProgression/uploadYourDocumentsContents';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'common/models/AppRequest';

const uploadYourDocumentsViewPath = 'features/caseProgression/upload-your-documents';
const uploadYourDocumentsController = Router();

uploadYourDocumentsController.get([UPLOAD_YOUR_DOCUMENTS_URL], (async (req: AppRequest, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    req.session.previousUrl = req.originalUrl;
    res.render(uploadYourDocumentsViewPath, {uploadYourDocumentsContents:getUploadYourDocumentsContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadYourDocumentsController;
