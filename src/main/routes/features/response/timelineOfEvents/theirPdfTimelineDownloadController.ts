import {NextFunction, Request, Response, Router} from 'express';
import config from 'config';
import {CASE_TIMELINE_DOCUMENTS_URL} from '../../../urls';
import {DmStoreClient} from 'app/client/dmStoreClient';
import {displayPDF} from 'common/utils/downloadUtils';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const theirPdfTimelineDownloadController = Router();
const baseUrl: string = config.get<string>('services.dmStore.baseUrl');
const dmStoreClient = new DmStoreClient(baseUrl);

theirPdfTimelineDownloadController.get(CASE_TIMELINE_DOCUMENTS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const pdfDocument: Buffer = await dmStoreClient.retrieveDocumentByDocumentId(claim.extractDocumentId());
    displayPDF(res, pdfDocument, claim.generatePdfFileName());
  } catch (error) {
    next(error);
  }
});

export default theirPdfTimelineDownloadController;
