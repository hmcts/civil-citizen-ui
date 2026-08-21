import {CaseDocument} from './caseDocument';
import {DocumentType} from 'models/document/documentType';
import {
  CaseDocumentInfoExtractor,
} from 'services/features/caseProgression/SystemDocumentInfoExtractor';

export interface SystemGeneratedCaseDocuments {
  id: string,
  value: CaseDocument
}

export const getLatestSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType, defendantOrClaimant?: string) => {
  let documentId: string;
  if (systemGeneratedCaseDocuments?.length) {
    documentId = CaseDocumentInfoExtractor.getLatestSystemGeneratedCaseDocumentIdByType(systemGeneratedCaseDocuments, documentType, defendantOrClaimant);
  }
  return documentId;
});

export const getSystemGeneratedCaseDocumentIdByType = getLatestSystemGeneratedCaseDocumentIdByType;
