import * as express from 'express';
import config from 'config';
import {DM_STORE_RETRIEVE_DOCUMENTS_URL} from '../../../urls';
import {DmStoreClient} from '../../../../app/client/dmStoreClient';
import {DownloadUtils} from '../../../../common/utils/downloadUtils';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';

const defendantPDFTimelineDownloadController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('defendantPDFTimelineDownloadController');
const dmStoreBaseUrl = config.get<string>('services.dmStore.url');
const dmStoreClient: DmStoreClient = new DmStoreClient(dmStoreBaseUrl);

defendantPDFTimelineDownloadController.get(DM_STORE_RETRIEVE_DOCUMENTS_URL, async (req: express.Request, res: express.Response) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const pdfDocument: Buffer = await dmStoreClient.retrieveDocumentByDocumentId(req.params.documentId);
    DownloadUtils.downloadPDF(res, pdfDocument, claim.generatePdfFileName()); 
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default defendantPDFTimelineDownloadController;
