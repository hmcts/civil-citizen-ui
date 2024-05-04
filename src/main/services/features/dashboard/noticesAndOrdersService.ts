import {Claim} from 'models/claim';
import {DocumentType} from 'models/document/documentType';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DirectionQuestionnaireType} from 'models/directionsQuestionnaire/directionQuestionnaireType';
import {CaseDocument} from 'models/document/caseDocument';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {Document} from 'models/document/document';
import {documentIdExtractor} from 'common/utils/stringUtils';

export const getClaimantDocuments = (claim: Claim, claimId: string, lang: string) => {
  const claimantDocumentsArray: DocumentInformation[] = [];
  if (claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH) {
    claimantDocumentsArray.push(...getClaimantBilingualDirectionQuestionnaire(claim, claimId, lang));
  } else {
    claimantDocumentsArray.push(...getClaimantDirectionQuestionnaire(claim, claimId, lang));
  }

  if (claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH) {
    claimantDocumentsArray.push(...getClaimantBilingualSealClaimForm(claim, claimId, lang));
  } else {
    claimantDocumentsArray.push(...getClaimantSealClaimForm(claim, claimId, lang));
  }

  if (claim.isClaimant()) {
    claimantDocumentsArray.push(...getClaimantUnsealClaimForm(claim, claimId, lang));
    claimantDocumentsArray.push(...getClaimantDraftClaim(claim, claimId, lang));
  }
  // Documents for LR only
  claimantDocumentsArray.push(...getClaimantTimelineEventsDocument(claim, claimId, lang));
  claimantDocumentsArray.push(...getClaimantParticularsOfClaim(claim, claimId, lang));
  return new DocumentsViewComponent('Claimant', claimantDocumentsArray);
};

export const getDefendantDocuments = (claim: Claim, claimId: string, lang: string) => {
  const defendantDocumentsArray: DocumentInformation[] = [];
  if (claim.claimBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH) {
    defendantDocumentsArray.push(...getDefendantBilingualResponse(claim, claimId, lang));
  } else {
    defendantDocumentsArray.push(...getDefendantResponse(claim, claimId, lang));
  }
  defendantDocumentsArray.push(...getDefendantDirectionQuestionnaire(claim, claimId, lang));
  // Documents for LR only
  return new DocumentsViewComponent('Defendant', defendantDocumentsArray);
};

export const getCourtDocuments = (claim: Claim, claimId: string, lang: string) => {
  const courtDocumentsArray: DocumentInformation[] = [];
  courtDocumentsArray.push(...getStandardDirectionsOrder(claim, claimId, lang));
  courtDocumentsArray.push(...getManualDetermination(claim, claimId, lang));
  courtDocumentsArray.push(...getCcjRequestAdmission(claim, claimId, lang));
  courtDocumentsArray.push(...getInterlocutoryJudgement(claim, claimId, lang));
  courtDocumentsArray.push(...getCcjRequestDetermination(claim, claimId, lang));
  courtDocumentsArray.push(...getSettlementAgreement(claim, claimId, lang));

  return new DocumentsViewComponent('CourtDocument', courtDocumentsArray);
};

const getClaimantDirectionQuestionnaire = (claim: Claim, claimId: string, lang: string) => {
  const claimantDq = claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT);
  return claimantDq ? Array.of(setUpDocumentLinkObject(
    claimantDq, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.CLAIMANT_DQ', DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT)) : [];
};

const getClaimantBilingualDirectionQuestionnaire = (claim: Claim, claimId: string, lang: string) => {
  const claimantBilingualDq = claim.getDocumentDetails(DocumentType.CLAIMANT_INTENTION_TRANSLATED_DOCUMENT);
  return claimantBilingualDq ? Array.of(setUpDocumentLinkObject(
    claimantBilingualDq, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.CLAIMANT_DQ', DocumentType.CLAIMANT_INTENTION_TRANSLATED_DOCUMENT)) : [];
};

const getClaimantSealClaimForm = (claim: Claim, claimId: string, lang: string) => {
  const claimantSealClaim = claim.getDocumentDetails(DocumentType.SEALED_CLAIM, DirectionQuestionnaireType.CLAIMANT);
  return claimantSealClaim ? Array.of(setUpDocumentLinkObject(
    claimantSealClaim, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.SEALED_CLAIM', DocumentType.SEALED_CLAIM, DirectionQuestionnaireType.CLAIMANT)) : [];
};

const getClaimantBilingualSealClaimForm = (claim: Claim, claimId: string, lang: string) => {
  const claimantBilingualSealClaim = claim.getDocumentDetails(DocumentType.CLAIM_ISSUE_TRANSLATED_DOCUMENT);
  return claimantBilingualSealClaim ? Array.of(setUpDocumentLinkObject(
    claimantBilingualSealClaim, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.SEALED_CLAIM', DocumentType.CLAIM_ISSUE_TRANSLATED_DOCUMENT)) : [];
};

const getClaimantUnsealClaimForm = (claim: Claim, claimId: string, lang: string) => {
  const claimantClaimForm = claim.getDocumentDetails(DocumentType.CLAIMANT_CLAIM_FORM);
  return claimantClaimForm ? Array.of(setUpDocumentLinkObject(
    claimantClaimForm, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.UNSEALED_CLAIM', DocumentType.CLAIMANT_CLAIM_FORM)) : [];
};

const getClaimantDraftClaim = (claim: Claim, claimId: string, lang: string) => {
  const claimantDraftClaim = claim.getDocumentDetails(DocumentType.DRAFT_CLAIM_FORM);
  return claimantDraftClaim ? Array.of(setUpDocumentLinkObject(
    claimantDraftClaim, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.DRAFT_CLAIM', DocumentType.DRAFT_CLAIM_FORM)) : [];
};

const getClaimantTimelineEventsDocument = (claim: Claim, claimId: string, lang: string) => {
  const timeLineDocument = claim.specClaimTemplateDocumentFiles;
  return timeLineDocument ? Array.of(setUpDocumentLinkObjectForUpload(
    timeLineDocument, claim.submittedDate, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.CLAIMANT_TIMELINE')) : [];
};

const getClaimantParticularsOfClaim = (claim: Claim, claimId: string, lang: string) => {
  const particularsOfClaim = claim.specParticularsOfClaimDocumentFiles;
  return particularsOfClaim ? Array.of(setUpDocumentLinkObjectForUpload(
    particularsOfClaim, claim.submittedDate, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.PARTICULARS_CLAIM')) : [];
};

const getDefendantResponse = (claim: Claim, claimId: string, lang: string) => {
  const defendResponse = claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE);
  return defendResponse ? Array.of(setUpDocumentLinkObject(
    defendResponse, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.DEFENDANT_RESPONSE', DocumentType.DEFENDANT_DEFENCE)) : [];
};

const getDefendantBilingualResponse = (claim: Claim, claimId: string, lang: string) => {
  const defendBilingualResponse = claim.getDocumentDetails(DocumentType.DEFENCE_TRANSLATED_DOCUMENT);
  return defendBilingualResponse ? Array.of(setUpDocumentLinkObject(
    defendBilingualResponse, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.DEFENDANT_RESPONSE', DocumentType.DEFENCE_TRANSLATED_DOCUMENT)) : [];
};

const getDefendantDirectionQuestionnaire = (claim: Claim, claimId: string, lang: string) => {
  const defendantDq = claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.DEFENDANT);
  return defendantDq ? Array.of(setUpDocumentLinkObject(
    defendantDq, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.DEFENDANT_DQ', DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.DEFENDANT)) : [];
};

const getStandardDirectionsOrder = (claim: Claim, claimId: string, lang: string) => {
  const standardDirectionsOrder = claim.getDocumentDetails(DocumentType.SDO_ORDER, DirectionQuestionnaireType.DEFENDANT);
  return standardDirectionsOrder ? Array.of(setUpDocumentLinkObject(
    standardDirectionsOrder, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.STANDARD_DIRECTIONS_ORDER', DocumentType.SDO_ORDER)) : [];
};

const getManualDetermination = (claim: Claim, claimId: string, lang: string) => {
  const manualDetermination = claim.getDocumentDetails(DocumentType.LIP_MANUAL_DETERMINATION, DirectionQuestionnaireType.DEFENDANT);
  return manualDetermination ? Array.of(setUpDocumentLinkObject(
    manualDetermination, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.DETERMINATION_REQUEST', DocumentType.LIP_MANUAL_DETERMINATION)) : [];
};

const getCcjRequestAdmission = (claim: Claim, claimId: string, lang: string) => {
  const ccjRequestAdmission = claim.getDocumentDetails(DocumentType.CCJ_REQUEST_ADMISSION, DirectionQuestionnaireType.DEFENDANT);
  return ccjRequestAdmission ? Array.of(setUpDocumentLinkObject(
    ccjRequestAdmission, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.CCJ_REQUEST', DocumentType.CCJ_REQUEST_ADMISSION)) : [];
};

const getInterlocutoryJudgement = (claim: Claim, claimId: string, lang: string) => {
  const interlocutoryJudgement = claim.getDocumentDetails(DocumentType.INTERLOCUTORY_JUDGEMENT);
  return interlocutoryJudgement ? Array.of(setUpDocumentLinkObject(
    interlocutoryJudgement, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.CLAIMANT_RESPONSE_RECEIPT', DocumentType.INTERLOCUTORY_JUDGEMENT)) : [];
};

const getCcjRequestDetermination = (claim: Claim, claimId: string, lang: string) => {
  const ccjRequestDetermination = claim.getDocumentDetails(DocumentType.CCJ_REQUEST_DETERMINATION);
  return ccjRequestDetermination ? Array.of(setUpDocumentLinkObject(
    ccjRequestDetermination, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.CCJ_REQUEST', DocumentType.CCJ_REQUEST_DETERMINATION)) : [];
};

const getSettlementAgreement = (claim: Claim, claimId: string, lang: string) => {
  const settlementAgreement = claim.getDocumentDetails(DocumentType.SETTLEMENT_AGREEMENT);
  return settlementAgreement ? Array.of(setUpDocumentLinkObject(
    settlementAgreement, claim, claimId, lang, 'PAGES.NOTICES_AND_ORDERS.SETTLEMENT_AGREEMENT', DocumentType.SETTLEMENT_AGREEMENT)) : [];
};

const setUpDocumentLinkObject = (caseDocument: CaseDocument, claim: Claim, claimId: string, lang: string, fileName: string, documentType: DocumentType, claimantOrDefendant? : string) => {
  return new DocumentInformation(
    fileName,
    formatDateToFullDate(caseDocument.createdDatetime, lang),
    new DocumentLinkInformation(
      CASE_DOCUMENT_VIEW_URL.replace(':id', claimId)
        .replace(':documentId',
          getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, documentType, claimantOrDefendant)),
      caseDocument.documentName));
};

const setUpDocumentLinkObjectForUpload = (document: Document, documentDate: Date, claimId: string, lang: string, fileName: string) => {
  return new DocumentInformation(
    fileName,
    formatDateToFullDate(documentDate, lang),
    new DocumentLinkInformation(
      CASE_DOCUMENT_VIEW_URL.replace(':id', claimId)
        .replace(':documentId',
          documentIdExtractor(document.document_binary_url)),
      document.document_filename));
};
