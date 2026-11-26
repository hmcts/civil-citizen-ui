import {documentIdExtractor} from 'common/utils/stringUtils';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {isUsablePathSegment} from 'common/utils/routeParamUtils';

export class CaseDocumentInfoExtractor {
  static matchesDocumentType = (
    document: SystemGeneratedCaseDocuments,
    documentType: DocumentType,
    defendantOrClaimant?: string,
  ): boolean => {
    if (documentType == DocumentType.DIRECTIONS_QUESTIONNAIRE) {
      return document.value.documentType === documentType
        && !!defendantOrClaimant
        && document.value.documentName.startsWith(defendantOrClaimant);
    }
    if (documentType == DocumentType.SEALED_CLAIM) {
      if (defendantOrClaimant === 'defendant') {
        return document.value.documentType === documentType && document.value.documentName.includes('_response_');
      }
      return document.value.documentType === documentType && !document.value.documentName.includes('_response_');
    }
    return document.value.documentType === documentType;
  };

  static getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType, defendantOrClaimant?: string) => {
    // Prefer the first matching entry whose extracted id is usable — CCD order is not guaranteed,
    // so a documents/null sentinel earlier in the collection must not hide a later valid id.
    for (const document of systemGeneratedCaseDocuments) {
      if (!CaseDocumentInfoExtractor.matchesDocumentType(document, documentType, defendantOrClaimant)) {
        continue;
      }
      const documentId = documentIdExtractor(document.value?.documentLink?.document_binary_url);
      if (isUsablePathSegment(documentId)) {
        return documentId;
      }
    }
    return null;
  });
}
