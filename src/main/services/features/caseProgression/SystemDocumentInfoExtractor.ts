import {documentIdExtractor} from 'common/utils/stringUtils';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

export class CaseDocumentInfoExtractor {
  static getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType, defendantOrClaimant?: string) => {
    const sealedDocument = systemGeneratedCaseDocuments.find((document) => {
      if (documentType == DocumentType.DIRECTIONS_QUESTIONNAIRE) {
        return document.value.documentType === documentType && document.value.documentName.startsWith(defendantOrClaimant);
      }
      return document.value.documentType === documentType;
    });
    return sealedDocument ? documentIdExtractor(sealedDocument.value?.documentLink?.document_binary_url) : null;
  });
}
