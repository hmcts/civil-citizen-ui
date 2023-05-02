import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {downloadPDF} from 'common/utils/downloadUtils';
import {convertToDocumentType} from 'common/utils/documentTypeConverter';
import {AppRequest} from 'models/AppRequest';
import {DocumentType} from 'models/document/documentType';
import {Claim} from 'models/claim';

const documentDownloadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

documentDownloadController.get(CASE_DOCUMENT_DOWNLOAD_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim: Claim = await civilServiceClient.retrieveClaimDetails(req.params.id, <AppRequest>req);
    const documentType = convertToDocumentType(req.params.documentType);
    const documentDetails = claim.getDocumentDetails(DocumentType[documentType]);
    const pdfDocument: Buffer = await civilServiceClientForDocRetrieve.retrieveDocument(documentDetails, <AppRequest>req);
    downloadPDF(res, pdfDocument, documentDetails.documentName);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default documentDownloadController;
