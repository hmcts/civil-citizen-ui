import {documentIdExtractor} from 'common/utils/stringUtils';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

export class CaseDocumentInfoExtractor {
  static getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType) => {
    const sealedDocument = systemGeneratedCaseDocuments.find((document) => {
      return document.value.documentType === documentType;
    });
    return sealedDocument ? documentIdExtractor(sealedDocument.value?.documentLink?.document_binary_url) : null;
  });
}
