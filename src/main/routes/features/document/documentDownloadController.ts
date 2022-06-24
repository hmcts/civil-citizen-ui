import * as express from 'express';
import config from 'config';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../urls';
import {CivilServiceClient} from  '../../../app/client/civilServiceClient';
import * as documentUtils from '../../../common/utils/downloadUtils';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {convertToDocumentType} from '../../../common/utils/documentTypeConverter';

import {AppRequest} from '../../../common/models/AppRequest';
import {DocumentType} from '../../../common/models/document/documentType';

const documentDownloadController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('documentDownLoadController');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

documentDownloadController.get(CASE_DOCUMENT_DOWNLOAD_URL, async (req: express.Request, res: express.Response) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const documentType = convertToDocumentType(req.params.documentType);
    const documentDetails = claim.getDocumentDetails(DocumentType[documentType]);
    const pdfDocument: Buffer = await civilServiceClient.retrieveDocument(documentDetails, <AppRequest>req);
    documentUtils.downloadPDF(res, pdfDocument, documentDetails.documentName);
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default documentDownloadController;
