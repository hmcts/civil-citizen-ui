import {CaseDocument} from './caseDocument';
import {DocumentType} from 'models/document/documentType';
import {documentIdPrettify} from 'common/utils/stringUtils';

export interface SystemGeneratedCaseDocuments {
  id: string,
  value: CaseDocument
}
export const getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[] , documentType: DocumentType) => {
  const sealedDocument = systemGeneratedCaseDocuments.find((document) => {
    return document.value.documentType === documentType;
  });
  return documentIdPrettify(sealedDocument.value.documentLink.document_binary_url);
});

