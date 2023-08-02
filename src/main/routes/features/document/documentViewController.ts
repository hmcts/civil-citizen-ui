import {NextFunction, Request, Response, Router} from 'express';
import config from 'config';
import {CASE_DOCUMENT_VIEW_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {viewFile} from 'common/utils/downloadUtils';

const documentViewController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

documentViewController.get(CASE_DOCUMENT_VIEW_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await civilServiceClientForDocRetrieve.retrieveDocument(req.params.documentId);
    viewFile(res, document);
    return res.status(200);
  } catch (error) {
    next(error);
  }
});
export default documentViewController;
