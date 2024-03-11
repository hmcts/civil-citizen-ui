import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {downloadFile} from 'common/utils/downloadUtils';
import {AppRequest} from 'models/AppRequest';

const documentDownloadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);
documentDownloadController.get(CASE_DOCUMENT_DOWNLOAD_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await civilServiceClientForDocRetrieve.retrieveDocument(<AppRequest> req, req.params.documentId);
    downloadFile(res, document);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default documentDownloadController;
