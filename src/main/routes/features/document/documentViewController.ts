import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {CASE_DOCUMENT_VIEW_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {viewFileStream} from 'common/utils/downloadUtils';
import {AppRequest} from 'models/AppRequest';
import {
  getRouteParam,
  MissingPathSegmentError,
  requirePathSegment,
} from 'common/utils/routeParamUtils';

const documentViewController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

documentViewController.get(CASE_DOCUMENT_VIEW_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Central guard for remaining link builders that may still emit null/undefined document ids.
    const documentId = requirePathSegment(getRouteParam(req, 'documentId'), 'documentId');
    const document = await civilServiceClientForDocRetrieve.retrieveDocumentStream(<AppRequest> req, documentId);
    viewFileStream(res, document);
  } catch (error) {
    // Unusable document ids are a client/not-found case, not a server fault (avoid 500 + App Insights).
    if (error instanceof MissingPathSegmentError) {
      res.status(404);
      return res.render('not-found');
    }
    next(error);
  }
}) as RequestHandler);
export default documentViewController;
