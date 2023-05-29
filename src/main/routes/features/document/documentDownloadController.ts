import {NextFunction, Request, Response, Router} from 'express';
import config from 'config';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {downloadPDF} from "common/utils/downloadUtils";


const documentDownloadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

documentDownloadController.get(CASE_DOCUMENT_DOWNLOAD_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    //const claim: Claim = await civilServiceClient.retrieveClaimDetails(req.params.id, <AppRequest>req);
    //const documentType = convertToDocumentType(req.params.documentId);
    //const documentDetails = claim.getDocumentDetails(DocumentType[documentType]);
    const document = await civilServiceClientForDocRetrieve.retrieveDocument(req.params.documentId);
    downloadPDF(res, document);
  } catch (error) {
    next(error);
  }
});

export default documentDownloadController;
