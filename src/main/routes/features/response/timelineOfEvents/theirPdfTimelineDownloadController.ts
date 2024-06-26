import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {CASE_TIMELINE_DOCUMENTS_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {displayPDF} from 'common/utils/downloadUtils';
import {AppRequest} from 'models/AppRequest';

const theirPdfTimelineDownloadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

theirPdfTimelineDownloadController.get(CASE_TIMELINE_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pdfDocument = await civilServiceClientForDocRetrieve.retrieveDocument(<AppRequest> req, req.params.documentId);
    displayPDF(res, pdfDocument);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default theirPdfTimelineDownloadController;
