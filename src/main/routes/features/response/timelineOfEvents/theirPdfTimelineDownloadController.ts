import {NextFunction, Request, Response, Router} from 'express';
import config from 'config';
import {CASE_TIMELINE_DOCUMENTS_URL} from '../../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {displayPDF} from '../../../../common/utils/downloadUtils';

const theirPdfTimelineDownloadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

theirPdfTimelineDownloadController.get(CASE_TIMELINE_DOCUMENTS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pdfDocument = await civilServiceClientForDocRetrieve.retrieveDocument(req.params.documentId);
    displayPDF(res, pdfDocument, pdfDocument.fileName);
  } catch (error) {
    next(error);
  }
});

export default theirPdfTimelineDownloadController;
