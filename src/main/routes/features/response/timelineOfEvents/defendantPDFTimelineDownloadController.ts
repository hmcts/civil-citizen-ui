import * as express from 'express';
// import config from 'config';
import {DM_STORE_RETRIEVE_DOCUMENTS_URL} from '../../../urls';
import {DocumentsClient} from '../../../../app/client/documentsClient';
import {AppRequest} from '../../../../common/models/AppRequest';
import {DownloadUtils} from '../../../../common/utils/downloadUtils';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';

const defendantPDFTimelineDownloadController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('defendantPDFTimelineDownloadController');
// const dmStoreBaseUrl = config.get<string>('services.dmStore.url');
const dmStoreBaseUrl = 'http://localhost:4506/documents';
const documentsClient: DocumentsClient = new DocumentsClient(dmStoreBaseUrl);

defendantPDFTimelineDownloadController.get(DM_STORE_RETRIEVE_DOCUMENTS_URL, async (req: express.Request, res: express.Response) => {
  console.log('------download- controller----');
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const pdf : Buffer = await documentsClient.retrieveDocumentByDocumentId(req.params.externalId, <AppRequest>req);
    console.log({pdf});
    console.log('buffer--', pdf?.buffer)
    // res.send(pdf)
    DownloadUtils.downloadPDF(res, pdf, `${claim.legacyCaseReference}-claim-form-claimant-copy`); 
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default defendantPDFTimelineDownloadController;
