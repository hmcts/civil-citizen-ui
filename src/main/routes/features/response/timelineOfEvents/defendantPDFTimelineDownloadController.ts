import * as express from 'express';
import config from 'config';
import {DM_STORE_RETRIEVE_DOCUMENTS_URL} from '../../../urls';
import {DmStoreClient} from '../../../../app/client/dmStoreClient';
import {AppRequest} from '../../../../common/models/AppRequest';
// import {DownloadUtils} from '../../../../common/utils/downloadUtils';
// import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
// import {Blob} from 'buffer';

const defendantPDFTimelineDownloadController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('defendantPDFTimelineDownloadController');
const dmStoreBaseUrl = config.get<string>('services.dmStore.url');
const dmStoreClient: DmStoreClient = new DmStoreClient(dmStoreBaseUrl);

defendantPDFTimelineDownloadController.get(DM_STORE_RETRIEVE_DOCUMENTS_URL, async (req: express.Request, res: express.Response) => {
  console.log('------download--controller----');
  const externalId = '74bf213e-72dd-4908-9e08-72fefaed9c5c';
  try {
    // const claim = await getCaseDataFromStore(req.params.id);
    const pdf = await dmStoreClient.retrieveDocumentByDocumentId(externalId, <AppRequest>req);
    res.send(pdf);
    // DownloadUtils.downloadPDF(res, pdf, `${claim.legacyCaseReference}-claim-form-claimant-copy`); 
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default defendantPDFTimelineDownloadController;
