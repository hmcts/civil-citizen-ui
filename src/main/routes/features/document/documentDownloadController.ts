import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {downloadFileStream} from 'common/utils/downloadUtils';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const documentDownloadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);
documentDownloadController.get(CASE_DOCUMENT_DOWNLOAD_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await civilServiceClientForDocRetrieve.retrieveDocumentStream(<AppRequest> req, getRouteParam(req, 'documentId'));
    downloadFileStream(res, document);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default documentDownloadController;
