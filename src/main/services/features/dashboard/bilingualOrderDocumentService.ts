import {Claim} from 'models/claim';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {DocumentType} from 'models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {CaseProgressionHearingDocuments} from 'models/caseProgression/caseProgressionHearing';

/**
 * OCCC-827: pick the document id a party should open for SDO / final order / hearing notice.
 * ENGLISH → EN, WELSH → CY, BOTH → stitched bilingual (EN then CY).
 * Returns undefined when the preferred document is not yet available (awaiting translation / stitch).
 */
export type OrderDocumentKind = 'SDO' | 'FINAL_ORDER' | 'HEARING_NOTICE';

const partyLanguage = (claim: Claim, isClaimant: boolean): ClaimBilingualLanguagePreference => {
  if (isClaimant) {
    return claim.claimantBilingualLanguagePreference ?? ClaimBilingualLanguagePreference.ENGLISH;
  }
  const defendantLanguage = claim.respondent1LiPResponse?.respondent1ResponseLanguage;
  if (defendantLanguage === 'WELSH') {
    return ClaimBilingualLanguagePreference.WELSH;
  }
  if (defendantLanguage === 'BOTH') {
    return ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
  }
  return ClaimBilingualLanguagePreference.ENGLISH;
};

const documentTypeFor = (kind: OrderDocumentKind, language: ClaimBilingualLanguagePreference): DocumentType => {
  if (kind === 'SDO') {
    switch (language) {
      case ClaimBilingualLanguagePreference.WELSH:
        return DocumentType.SDO_TRANSLATED_DOCUMENT;
      case ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH:
        return DocumentType.SDO_BILINGUAL_DOCUMENT;
      default:
        return DocumentType.SDO_ORDER;
    }
  }
  if (kind === 'HEARING_NOTICE') {
    switch (language) {
      case ClaimBilingualLanguagePreference.WELSH:
        return DocumentType.TRANSLATED_HEARING_NOTICE;
      case ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH:
        return DocumentType.HEARING_NOTICE_BILINGUAL_DOCUMENT;
      default:
        return DocumentType.HEARING_FORM;
    }
  }
  switch (language) {
    case ClaimBilingualLanguagePreference.WELSH:
      return DocumentType.FINAL_ORDER_TRANSLATED_DOCUMENT;
    case ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH:
      return DocumentType.FINAL_ORDER_BILINGUAL_DOCUMENT;
    default:
      return DocumentType.JUDGE_FINAL_ORDER;
  }
};

const idFromBinaryUrl = (binaryUrl?: string): string | undefined =>
  binaryUrl ? documentIdExtractor(binaryUrl) : undefined;

const idFromCollection = (
  collection: CaseProgressionHearingDocuments[] | undefined,
  documentType: DocumentType,
  fallbackTypes: DocumentType[] = [],
): string | undefined => {
  if (!collection?.length) {
    return undefined;
  }
  const types = [documentType, ...fallbackTypes];
  const match = [...collection]
    .reverse()
    .find((doc) => types.includes(doc?.value?.documentType as DocumentType));
  return idFromBinaryUrl(match?.value?.documentLink?.document_binary_url);
};

const idFromCollectionFirst = (
  collection: CaseProgressionHearingDocuments[] | undefined,
): string | undefined =>
  idFromBinaryUrl(collection?.[0]?.value?.documentLink?.document_binary_url);

export const partyPrefersTranslatedOrBilingualOrder = (
  claim: Claim,
  isClaimant: boolean,
  welshEnabled = true,
): boolean => {
  if (!welshEnabled) {
    return false;
  }
  const language = partyLanguage(claim, isClaimant);
  return language === ClaimBilingualLanguagePreference.WELSH
    || language === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
};

export const resolveOrderDocumentId = (
  claim: Claim,
  isClaimant: boolean,
  kind: OrderDocumentKind,
  welshEnabled = true,
): string | undefined => {
  const language = welshEnabled
    ? partyLanguage(claim, isClaimant)
    : ClaimBilingualLanguagePreference.ENGLISH;
  const documentType = documentTypeFor(kind, language);

  if (kind === 'SDO') {
    return getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, documentType);
  }

  if (kind === 'HEARING_NOTICE') {
    if (language === ClaimBilingualLanguagePreference.WELSH) {
      return idFromCollection(
        claim.caseProgressionHearing?.hearingDocumentsWelsh,
        DocumentType.TRANSLATED_HEARING_NOTICE,
        [DocumentType.HEARING_FORM_WELSH],
      ) ?? idFromCollectionFirst(claim.caseProgressionHearing?.hearingDocumentsWelsh);
    }
    return idFromCollection(claim.caseProgressionHearing?.hearingDocuments, documentType)
      ?? (language === ClaimBilingualLanguagePreference.ENGLISH
        ? idFromCollectionFirst(claim.caseProgressionHearing?.hearingDocuments)
        : undefined);
  }

  const collection = claim.caseProgression?.finalOrderDocumentCollection;
  if (!collection?.length) {
    return undefined;
  }
  const match = [...collection]
    .reverse()
    .find((doc) => doc?.value?.documentType === documentType);
  return match?.value?.documentLink?.document_binary_url
    ? documentIdExtractor(match.value.documentLink.document_binary_url)
    : getSystemGeneratedCaseDocumentIdByType(collection, documentType);
};

/**
 * OrderMade dashboard notifications use {VIEW_FINAL_ORDER} for both SDO and judge final orders.
 * Prefer a live final-order match, then fall back to SDO, so baked awaiting-translation links
 * still open the correct EN / CY / bilingual doc once it exists on the claim.
 */
export const resolveViewableOrderDocumentId = (
  claim: Claim,
  isClaimant: boolean,
  welshEnabled = true,
): string | undefined =>
  resolveOrderDocumentId(claim, isClaimant, 'FINAL_ORDER', welshEnabled)
  ?? resolveOrderDocumentId(claim, isClaimant, 'SDO', welshEnabled);
