import {NextFunction, RequestHandler, Router} from 'express';
import {UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getUploadYourDocumentsContents} from 'services/features/caseProgression/uploadYourDocumentsContents';

const uploadYourDocumentsViewPath = 'features/caseProgression/upload-your-documents';
const uploadYourDocumentsController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

uploadYourDocumentsController.get([UPLOAD_YOUR_DOCUMENTS_URL], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    res.render(uploadYourDocumentsViewPath, {uploadYourDocumentsContents:getUploadYourDocumentsContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadYourDocumentsController;
