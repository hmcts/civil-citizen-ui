import {CaseDocument} from './caseDocument';
import {DocumentType} from 'models/document/documentType';
import {SystemDocumentInfoExtractor} from 'services/features/caseProgression/SystemDocumentInfoExtractor';

export interface SystemGeneratedCaseDocuments {
  id: string,
  value: CaseDocument
}
export const getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[] , documentType: DocumentType) => {
  return SystemDocumentInfoExtractor.getSystemGeneratedCaseDocumentIdByType(systemGeneratedCaseDocuments, documentType);
});

