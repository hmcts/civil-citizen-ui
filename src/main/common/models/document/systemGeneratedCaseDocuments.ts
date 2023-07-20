import {CaseDocument} from './caseDocument';
import {DocumentType} from 'models/document/documentType';
import {SystemDocumentInfoExtractor} from 'services/features/caseProgression/SystemDocumentInfoExtractor';
import {ClaimBilingualLanguagePreference} from '../claimBilingualLanguagePreference';

export interface SystemGeneratedCaseDocuments {
  id: string,
  value: CaseDocument
}

export const getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType, respondentResponseLanguage?: ClaimBilingualLanguagePreference) => {
  let documentId: string;
  if (systemGeneratedCaseDocuments?.length) {
    documentId = SystemDocumentInfoExtractor.getSystemGeneratedCaseDocumentIdByType(systemGeneratedCaseDocuments, documentType, respondentResponseLanguage);
  }
  return documentId;
});

