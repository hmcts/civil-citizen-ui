import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {CASE_TIMELINE_DOCUMENTS_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {displayPDF} from 'common/utils/downloadUtils';
import {AppRequest} from 'models/AppRequest';
import {
  getRouteParam,
  MissingPathSegmentError,
  requirePathSegment,
} from 'common/utils/routeParamUtils';

const theirPdfTimelineDownloadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

theirPdfTimelineDownloadController.get(CASE_TIMELINE_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const documentId = requirePathSegment(getRouteParam(req, 'documentId'), 'documentId');
    const pdfDocument = await civilServiceClientForDocRetrieve.retrieveDocument(<AppRequest> req, documentId);
    displayPDF(res, pdfDocument);
  } catch (error) {
    if (error instanceof MissingPathSegmentError) {
      res.status(404);
      return res.render('not-found');
    }
    next(error);
  }
}) as RequestHandler);

export default theirPdfTimelineDownloadController;
