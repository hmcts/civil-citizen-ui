import {NextFunction, RequestHandler, Router} from 'express';
import {UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getUploadYourDocumentsContents} from 'services/features/caseProgression/uploadYourDocumentsContents';
import {getClaimById} from 'modules/utilityService';

const uploadYourDocumentsViewPath = 'features/caseProgression/upload-your-documents';
const uploadYourDocumentsController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
new CivilServiceClient(civilServiceApiBaseUrl);
uploadYourDocumentsController.get([UPLOAD_YOUR_DOCUMENTS_URL], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    res.render(uploadYourDocumentsViewPath, {uploadYourDocumentsContents:getUploadYourDocumentsContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadYourDocumentsController;
