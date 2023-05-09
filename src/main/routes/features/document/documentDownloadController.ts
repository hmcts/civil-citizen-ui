import {NextFunction, Request, Response, Router} from 'express';
import config from 'config';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../urls';
import {CivilServiceClient} from  '../../../app/client/civilServiceClient';
import {downloadPDF} from '../../../common/utils/downloadUtils';
import {convertToDocumentType} from '../../../common/utils/documentTypeConverter';
import {AppRequest} from '../../../common/models/AppRequest';
import {DocumentType} from '../../../common/models/document/documentType';
import {Claim} from 'models/claim';
import {getClaimById} from '../../../modules/utilityService';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {CaseDocument} from 'models/document/caseDocument';

const documentDownloadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

documentDownloadController.get(CASE_DOCUMENT_DOWNLOAD_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim: Claim = await getClaimById(req.params.id, req);
    const documentType = convertToDocumentType(req.params.documentType);
    let documentDetails = claim.getDocumentDetails(DocumentType[documentType]);
    if (documentDetails === undefined && await isCaseProgressionV1Enable()){
      documentDetails = getCaseProgressionDocumentDetails(claim, documentType);
    }
    const pdfDocument: Buffer = await civilServiceClient.retrieveDocument(documentDetails, <AppRequest>req);
    downloadPDF(res, pdfDocument, documentDetails.documentName);
  } catch (error) {
    next(error);
  }
});
//TODO sdo haven't id from identification
const getCaseProgressionDocumentDetails = (claim: Claim, documentType: DocumentType): CaseDocument =>{
  return claim.caseProgression.caseProgressionDocuments.find(
    document => document.value.documentType === documentType)
    .value;
};

export default documentDownloadController;
