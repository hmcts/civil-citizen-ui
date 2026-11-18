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
  if (!systemGeneratedCaseDocuments?.length) {
    return undefined;
  }
  return CaseDocumentInfoExtractor.getSystemGeneratedCaseDocumentIdByType(
    systemGeneratedCaseDocuments,
    documentType,
    defendantOrClaimant,
  ) ?? undefined;
});

export const buildSystemGeneratedCaseDocumentUrl = (
  claimId: string,
  documentId: string | undefined,
  urlTemplate: string,
): string | undefined => {
  if (!documentId || !isUsablePathSegment(documentId)) {
    return undefined;
  }
  return urlTemplate.replace(':id', claimId).replace(':documentId', documentId);
};

/**
 * Resolve a viewable court-order document id from the claim when notification
 * params are empty/stale.
 *
 * When the Welsh flag is on:
 * - open a translated order if one exists
 * - for bilingual parties with no translated order yet, return undefined so
 *   callers keep awaiting-translation (do not open the English order)
 *
 * When the Welsh flag is off, fall back to the English order documents.
 */
export const getAvailableOrderDocumentIdFromClaim = (
  claim: {
    systemGeneratedCaseDocuments?: SystemGeneratedCaseDocuments[];
    caseProgression?: { finalOrderDocumentCollection?: SystemGeneratedCaseDocuments[] };
    isAnyPartyBilingual?: () => boolean;
  },
  welshEnabled = false,
): string | undefined => {
  const systemDocs = claim?.systemGeneratedCaseDocuments;

  if (welshEnabled) {
    const translatedDocumentId =
      getSystemGeneratedCaseDocumentIdByType(systemDocs, DocumentType.SDO_TRANSLATED_DOCUMENT)
      ?? getSystemGeneratedCaseDocumentIdByType(systemDocs, DocumentType.FINAL_ORDER_TRANSLATED_DOCUMENT)
      ?? getSystemGeneratedCaseDocumentIdByType(systemDocs, DocumentType.ORDER_NOTICE_TRANSLATED_DOCUMENT);

    if (translatedDocumentId) {
      return translatedDocumentId;
    }

    if (claim?.isAnyPartyBilingual?.()) {
      return undefined;
    }
  }

  return (
    getSystemGeneratedCaseDocumentIdByType(systemDocs, DocumentType.SDO_ORDER)
    ?? getSystemGeneratedCaseDocumentIdByType(
      claim?.caseProgression?.finalOrderDocumentCollection,
      DocumentType.JUDGE_FINAL_ORDER,
    )
    ?? getSystemGeneratedCaseDocumentIdByType(systemDocs, DocumentType.JUDGE_FINAL_ORDER)
  );
};
