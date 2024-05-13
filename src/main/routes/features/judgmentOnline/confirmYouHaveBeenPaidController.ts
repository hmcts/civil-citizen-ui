import {NextFunction, RequestHandler, Router} from 'express';
import {CONFIRM_YOU_HAVE_BEEN_PAID_URL} from '../../urls';
import {getUploadYourDocumentsContents} from 'services/features/caseProgression/uploadYourDocumentsContents';
import {getClaimById} from 'modules/utilityService';

const uploadYourDocumentsViewPath = 'features/judgmentOnline/confirm-you-have-been-paid';
const uploadYourDocumentsController = Router();

uploadYourDocumentsController.get(CONFIRM_YOU_HAVE_BEEN_PAID_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    res.render(uploadYourDocumentsViewPath, {uploadYourDocumentsContents:getUploadYourDocumentsContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadYourDocumentsController;
