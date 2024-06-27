import {Claim} from 'models/claim';
import {DocumentType} from 'models/document/documentType';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {DirectionQuestionnaireType} from 'models/directionsQuestionnaire/directionQuestionnaireType';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {Document} from 'models/document/document';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';

export const getClaimantDocuments = (claim: Claim, claimId: string, lang: string) => {
  const claimantDocumentsArray: DocumentInformation[] = [];
  claimantDocumentsArray.push(...getClaimantDirectionQuestionnaire(claim, claimId, lang));
  claimantDocumentsArray.push(...getClaimantSealClaimForm(claim, claimId, lang));

  if (claim.isClaimant()) {
    claimantDocumentsArray.push(...getClaimantUnsealClaimForm(claim, claimId, lang));
    claimantDocumentsArray.push(...getClaimantDraftClaim(claim, claimId, lang));
  }
  // Documents for LR only
  claimantDocumentsArray.push(...getClaimantParticularsOfClaim(claim, claimId, lang));
  claimantDocumentsArray.push(...getClaimantTimelineEventsDocument(claim, claimId, lang));
  claimantDocumentsArray.push(...getClaimantResponseToDefenceDocument(claim, claimId, lang));
  return new DocumentsViewComponent('Claimant', claimantDocumentsArray);
};

export const getDefendantDocuments = (claim: Claim, claimId: string, lang: string) => {
  const defendantDocumentsArray: DocumentInformation[] = [];
  defendantDocumentsArray.push(...getDefendantResponse(claim, claimId, lang));
  defendantDocumentsArray.push(...getDefendantDirectionQuestionnaire(claim, claimId, lang));
  // Documents for LR only
  defendantDocumentsArray.push(...getDefendantSupportDocument(claim, claimId, lang));
  return new DocumentsViewComponent('Defendant', defendantDocumentsArray);
};

export const getCourtDocuments = async (claim: Claim, claimId: string, lang: string) => {
  const courtDocumentsArray: DocumentInformation[] = [];
  const caseProgressionEnabled = await isCaseProgressionV1Enable();
  courtDocumentsArray.push(...getStandardDirectionsOrder(claim, claimId, lang));
  courtDocumentsArray.push(...getManualDetermination(claim, claimId, lang));
  courtDocumentsArray.push(...getCcjRequestAdmission(claim, claimId, lang));
  courtDocumentsArray.push(...getInterlocutoryJudgement(claim, claimId, lang));
  courtDocumentsArray.push(...getCcjRequestDetermination(claim, claimId, lang));
  courtDocumentsArray.push(...getSettlementAgreement(claim, claimId, lang));

  if (caseProgressionEnabled) {
    courtDocumentsArray.push(...getDecisionOnReconsideration(claim, claimId, lang));
  }

  return new DocumentsViewComponent('CourtDocument', courtDocumentsArray);
};

const getClaimantDirectionQuestionnaire = (claim: Claim, claimId: string, lang: string) => {
  const claimantDq = isBilingual(claim.claimantBilingualLanguagePreference) ?
    claim.getDocumentDetails(DocumentType.CLAIMANT_INTENTION_TRANSLATED_DOCUMENT) :
    claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT);
  return claimantDq ? Array.of(
    setUpDocumentLinkObject(claimantDq.documentLink, claimantDq.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CLAIMANT_DQ')) : [];
};

const getClaimantSealClaimForm = (claim: Claim, claimId: string, lang: string) => {
  const claimantSealClaim = isBilingual(claim.claimantBilingualLanguagePreference) ?
    claim.getDocumentDetails(DocumentType.CLAIM_ISSUE_TRANSLATED_DOCUMENT) :
    claim.getDocumentDetails(DocumentType.SEALED_CLAIM, DirectionQuestionnaireType.CLAIMANT);
  return claimantSealClaim ? Array.of(
    setUpDocumentLinkObject(claimantSealClaim.documentLink, claimantSealClaim.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.SEALED_CLAIM')) : [];
};

const getClaimantUnsealClaimForm = (claim: Claim, claimId: string, lang: string) => {
  const claimantClaimForm = claim.getDocumentDetails(DocumentType.CLAIMANT_CLAIM_FORM);
  return claimantClaimForm ? Array.of(
    setUpDocumentLinkObject(claimantClaimForm.documentLink, claimantClaimForm.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.UNSEALED_CLAIM')) : [];
};

const getClaimantDraftClaim = (claim: Claim, claimId: string, lang: string) => {
  const claimantDraftClaim = claim.getDocumentDetails(DocumentType.DRAFT_CLAIM_FORM);
  return claimantDraftClaim ? Array.of(
    setUpDocumentLinkObject(claimantDraftClaim.documentLink, claimantDraftClaim.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DRAFT_CLAIM')) : [];
};

const getClaimantParticularsOfClaim = (claim: Claim, claimId: string, lang: string) => {
  const particularsOfClaim = claim.specParticularsOfClaimDocumentFiles;
  return particularsOfClaim ? Array.of(setUpDocumentLinkObject(
    particularsOfClaim, claim.submittedDate, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.PARTICULARS_CLAIM')) : [];
};

const getClaimantTimelineEventsDocument = (claim: Claim, claimId: string, lang: string) => {
  const timeLineDocument = claim.specClaimTemplateDocumentFiles;
  return timeLineDocument ? Array.of(setUpDocumentLinkObject(
    timeLineDocument, claim.submittedDate, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CLAIMANT_TIMELINE')) : [];
};

const getClaimantResponseToDefenceDocument = (claim: Claim, claimId: string, lang: string) => {
  const responseToDefenceDocument = claim.claimantResponse?.applicant1DefenceResponseDocumentSpec?.file;
  return responseToDefenceDocument ? Array.of(setUpDocumentLinkObject(
    responseToDefenceDocument, claim.claimantResponse?.submittedDate, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.RESPOND_TO_DEFENCE')) : [];
};

const getDefendantResponse = (claim: Claim, claimId: string, lang: string) => {
  const defendResponse =
    claim.isLRDefendant() ?
      claim.getDocumentDetails(DocumentType.SEALED_CLAIM, DirectionQuestionnaireType.DEFENDANT) :
      isBilingual(claim.claimBilingualLanguagePreference) ?
        claim.getDocumentDetails(DocumentType.DEFENCE_TRANSLATED_DOCUMENT) :
        claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE);
  return defendResponse ? Array.of(
    setUpDocumentLinkObject(defendResponse.documentLink, defendResponse.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE')) : [];
};

const getDefendantDirectionQuestionnaire = (claim: Claim, claimId: string, lang: string) => {
  const defendantDq = claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.DEFENDANT);
  return defendantDq ? Array.of(
    setUpDocumentLinkObject(defendantDq.documentLink, defendantDq.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DEFENDANT_DQ')) : [];
};

const getDefendantSupportDocument = (claim: Claim, claimId: string, lang: string) => {
  if (claim.defendantResponseDocuments?.length > 0) {
    const defendantSupportDoc = claim.defendantResponseDocuments[0].value;
    return defendantSupportDoc ? Array.of(
      setUpDocumentLinkObject(defendantSupportDoc.documentLink, defendantSupportDoc.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DEFENDANT_SUPPORT_DOC')) : [];
  }
  return [];
};

const getStandardDirectionsOrder = (claim: Claim, claimId: string, lang: string) => {
  const standardDirectionsOrder = claim.getDocumentDetails(DocumentType.SDO_ORDER);
  return standardDirectionsOrder ? Array.of(
    setUpDocumentLinkObject(standardDirectionsOrder.documentLink, standardDirectionsOrder.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.STANDARD_DIRECTIONS_ORDER')) : [];
};

const getManualDetermination = (claim: Claim, claimId: string, lang: string) => {
  const manualDetermination = claim.getDocumentDetails(DocumentType.LIP_MANUAL_DETERMINATION);
  return manualDetermination ? Array.of(
    setUpDocumentLinkObject(manualDetermination.documentLink, manualDetermination.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DETERMINATION_REQUEST')) : [];
};

const getCcjRequestAdmission = (claim: Claim, claimId: string, lang: string) => {
  const ccjRequestAdmission = claim.getDocumentDetails(DocumentType.CCJ_REQUEST_ADMISSION);
  return ccjRequestAdmission ? Array.of(
    setUpDocumentLinkObject(ccjRequestAdmission.documentLink, ccjRequestAdmission.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CCJ_REQUEST')) : [];
};

const getInterlocutoryJudgement = (claim: Claim, claimId: string, lang: string) => {
  const interlocutoryJudgement = claim.getDocumentDetails(DocumentType.INTERLOCUTORY_JUDGEMENT);
  return interlocutoryJudgement ? Array.of(
    setUpDocumentLinkObject(interlocutoryJudgement.documentLink, interlocutoryJudgement.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CLAIMANT_RESPONSE_RECEIPT')) : [];
};

const getCcjRequestDetermination = (claim: Claim, claimId: string, lang: string) => {
  const ccjRequestDetermination = claim.getDocumentDetails(DocumentType.CCJ_REQUEST_DETERMINATION);
  return ccjRequestDetermination ? Array.of(
    setUpDocumentLinkObject(ccjRequestDetermination.documentLink, ccjRequestDetermination.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CCJ_REQUEST')) : [];
};

const getSettlementAgreement = (claim: Claim, claimId: string, lang: string) => {
  const settlementAgreement = claim.getDocumentDetails(DocumentType.SETTLEMENT_AGREEMENT);
  return settlementAgreement ? Array.of(
    setUpDocumentLinkObject(settlementAgreement.documentLink, settlementAgreement.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.SETTLEMENT_AGREEMENT')) : [];
};

const getDecisionOnReconsideration = (claim: Claim, claimId: string, lang: string) => {
  const settlementAgreement = claim.getDocumentDetails(DocumentType.DECISION_MADE_ON_APPLICATIONS);
  return settlementAgreement ? Array.of(
    setUpDocumentLinkObject(settlementAgreement.documentLink, settlementAgreement.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DECISION_ON_RECONSIDERATION')) : [];
};

const setUpDocumentLinkObject = (document: Document, documentDate: Date, claimId: string, lang: string, fileName: string) => {
  return new DocumentInformation(
    fileName,
    formatDateToFullDate(documentDate, lang),
    new DocumentLinkInformation(
      CASE_DOCUMENT_VIEW_URL.replace(':id', claimId)
        .replace(':documentId',
          documentIdExtractor(document.document_binary_url)),
      document.document_filename));
};

const isBilingual = (languagePreference : ClaimBilingualLanguagePreference) => {
  return languagePreference=== ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
};
