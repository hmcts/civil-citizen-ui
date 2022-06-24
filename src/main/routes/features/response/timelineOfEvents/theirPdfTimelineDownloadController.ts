import * as express from 'express';
import config from 'config';
import {CASE_TIMELINE_DOCUMENTS_URL} from '../../../urls';
import {DmStoreClient} from '../../../../app/client/dmStoreClient';
import * as documentUtils from '../../../../common/utils/downloadUtils';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';

const theirPdfTimelineDownloadController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('theirPdfTimelineDownloadController');
const baseUrl: string = config.get<string>('services.dmStore.baseUrl');
const dmStoreClient = new DmStoreClient(baseUrl);

theirPdfTimelineDownloadController.get(CASE_TIMELINE_DOCUMENTS_URL, async (req: express.Request, res: express.Response) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const pdfDocument: Buffer = await dmStoreClient.retrieveDocumentByDocumentId(claim.extractDocumentId());
    documentUtils.displayPDF(res, pdfDocument, claim.generatePdfFileName()); 
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default theirPdfTimelineDownloadController;
