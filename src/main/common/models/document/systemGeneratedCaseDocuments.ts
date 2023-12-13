import {CaseDocument} from './caseDocument';
import {DocumentType} from 'models/document/documentType';
import {
  CaseDocumentInfoExtractor,
} from 'services/features/caseProgression/SystemDocumentInfoExtractor';

export interface SystemGeneratedCaseDocuments {
  id: string,
  value: CaseDocument
}

export const getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType, defendantOrClaimant?: string) => {
  let documentId: string;
  if (systemGeneratedCaseDocuments?.length) {
    documentId = CaseDocumentInfoExtractor.getSystemGeneratedCaseDocumentIdByType(systemGeneratedCaseDocuments, documentType, defendantOrClaimant);
  }
  return documentId;
});
