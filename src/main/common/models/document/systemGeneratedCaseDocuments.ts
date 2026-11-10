import {CaseDocument} from './caseDocument';
import {DocumentType} from 'models/document/documentType';
import {
  CaseDocumentInfoExtractor,
} from 'services/features/caseProgression/SystemDocumentInfoExtractor';
import {isUsablePathSegment} from 'common/utils/routeParamUtils';

export interface SystemGeneratedCaseDocuments {
  id: string,
  value: CaseDocument
}

export const getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType, defendantOrClaimant?: string) => {
  let documentId: string | null;
  if (systemGeneratedCaseDocuments?.length) {
    documentId = CaseDocumentInfoExtractor.getSystemGeneratedCaseDocumentIdByType(systemGeneratedCaseDocuments, documentType, defendantOrClaimant);
  }
  return documentId ?? undefined;
});

export const buildSystemGeneratedCaseDocumentUrl = (
  claimId: string,
  documentId: string | undefined,
  urlTemplate: string,
): string | undefined => {
  if (!isUsablePathSegment(documentId)) {
    return undefined;
  }
  return urlTemplate.replace(':id', claimId).replace(':documentId', documentId);
};
