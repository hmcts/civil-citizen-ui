import {NextFunction, RequestHandler, Router} from 'express';
import {UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {getUploadYourDocumentsContents} from 'services/features/caseProgression/uploadYourDocumentsContents';
import {getClaimById} from 'modules/utilityService';

const uploadYourDocumentsViewPath = 'features/caseProgression/upload-your-documents';
const uploadYourDocumentsController = Router();

uploadYourDocumentsController.get(UPLOAD_YOUR_DOCUMENTS_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    res.render(uploadYourDocumentsViewPath, {uploadYourDocumentsContents:getUploadYourDocumentsContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadYourDocumentsController;
