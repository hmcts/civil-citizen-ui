import {NextFunction, Request, Response, Router} from 'express';
import config from 'config';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {downloadFile} from 'common/utils/downloadUtils';
import {convertToDocumentType} from 'common/utils/documentTypeConverter';
import {AppRequest} from 'models/AppRequest';
import {DocumentType} from 'models/document/documentType';
import {Claim} from 'models/claim';
import {DmStoreClient} from 'client/dmStoreClient';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {documentIdPrettify, documentTypePrettify} from 'common/utils/stringUtils';
import {CaseDocument} from 'models/document/caseDocument';
const mime = require('mime');

const documentDownloadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const baseUrl: string = config.get<string>('services.dmStore.baseUrl');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const dmStoreClient = new DmStoreClient(baseUrl);
new CivilServiceClient(civilServiceApiBaseUrl, true);
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

function getDocumentByDocumentType(claim: Claim, documentType: string): CaseDocument {
  let documentByType: CaseDocument;
  claim.systemGeneratedCaseDocuments?.find((document: SystemGeneratedCaseDocuments) => {
    if (document.value.documentType === documentType) {
      documentByType = document.value;
    }
  });

  return documentByType;
}

async function getDocumentBuffer(document: CaseDocument, req: AppRequest) {
  try {
    return await dmStoreClient.retrieveDocumentByDocumentId(documentIdPrettify(document.documentLink.document_url));
  } catch (error) {
    try {
      return await civilServiceClientForDocRetrieve.retrieveDocument(document, req);
    }catch (error) {
      throw error;

    }
  }
}
function getFileMime(documentType:  string) {
  return mime.getType(documentType);
}

const getDocumentObject = async (claim: Claim, documentType: string, req: AppRequest) => {
  const document: CaseDocument = getDocumentByDocumentType(claim, DocumentType[convertToDocumentType(documentType)]);
  const mime = getFileMime(documentTypePrettify(document.documentLink.document_filename));
  const documentBuffer: Buffer = await getDocumentBuffer(document, <AppRequest>req);
  return {
    documentInfo: document,
    mime: mime,
    documentBuffer: documentBuffer,
  };
};

documentDownloadController.get(CASE_DOCUMENT_DOWNLOAD_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim: Claim = await civilServiceClient.retrieveClaimDetails(req.params.id, <AppRequest>req);
    const document = await getDocumentObject(claim, req.params.documentType,  <AppRequest>req);
    downloadFile(res, document.documentBuffer, document.documentInfo.documentName, document.mime);
  } catch (error) {
    next(error);
  }
});

export default documentDownloadController;
