import {CaseDocument} from 'models/document/caseDocument';
import {Document} from 'models/document/document';

export const mapperMediationDocumentToCCDDocuments = (caseDocument: CaseDocument, categoryId: string): Document => {

  return {
    category_id: categoryId,
    document_url: caseDocument.documentLink.document_url,
    document_filename: caseDocument.documentLink.document_filename,
    document_binary_url: caseDocument.documentLink.document_binary_url,
  } as Document;
};
