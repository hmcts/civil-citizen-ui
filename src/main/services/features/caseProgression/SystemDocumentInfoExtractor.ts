import {documentIdExtractor} from 'common/utils/stringUtils';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

export class CaseDocumentInfoExtractor {
  static getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType, defendantOrClaimant?: string) => {
   const sortedDocuments = systemGeneratedCaseDocuments.sort((a, b) => {
      return new Date(b.value.createdDatetime).getTime() - new Date(a.value.createdDatetime).getTime();
    });
    const sealedDocument = sortedDocuments.find((document) => {
      if (documentType == DocumentType.DIRECTIONS_QUESTIONNAIRE) {
        return document.value.documentType === documentType && document.value.documentName.startsWith(defendantOrClaimant);
      }
      return document.value.documentType === documentType;
    });
    return sealedDocument ? documentIdExtractor(sealedDocument.value?.documentLink?.document_binary_url) : null;
  });
}
