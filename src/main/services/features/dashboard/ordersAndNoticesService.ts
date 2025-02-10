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
import {
  isCaseProgressionV1Enable, isCaseWorkerEventsEnabled, isCoSCEnabled,
  isGaForLipsEnabled,isJudgmentOnlineLive,
} from '../../../app/auth/launchdarkly/launchDarklyClient';

export const getClaimantDocuments = async (claim: Claim, claimId: string, lang: string) => {
  const isCaseProgressionEnabled = await isCaseProgressionV1Enable();
  const isJoLiveValue = await isJudgmentOnlineLive();
  const claimantDocumentsArray: DocumentInformation[] = [];
  claimantDocumentsArray.push(...getClaimantDirectionQuestionnaire(claim, claimId, lang));
  claimantDocumentsArray.push(...getClaimantSealClaimForm(claim, claimId, lang));
  claimantDocumentsArray.push(...getClaimantRequestForReconsideration(claim, claimId, lang));

  if (claim.isClaimant()) {
    claimantDocumentsArray.push(...getClaimantUnsealClaimForm(claim, claimId, lang));
    claimantDocumentsArray.push(...getClaimantDraftClaim(claim, claimId, lang));
  }
  if (isCaseProgressionEnabled) {
    claimantDocumentsArray.push(...getTrialArrangementsDocument(claim, claimId, lang, true));
  }
  // Documents for LR only
  claimantDocumentsArray.push(...getClaimantParticularsOfClaim(claim, claimId, lang));
  claimantDocumentsArray.push(...getClaimantTimelineEventsDocument(claim, claimId, lang));
  claimantDocumentsArray.push(...getClaimantResponseToDefenceDocument(claim, claimId, lang));
  if(isJoLiveValue) {
    claimantDocumentsArray.push(...getJBAClaimantDocument(claim, claimId, lang));
    claimantDocumentsArray.push(...getDJClaimantDocument(claim, claimId, lang));
  }
  return new DocumentsViewComponent('Claimant', claimantDocumentsArray);
};

export const getDefendantDocuments = async (claim: Claim, claimId: string, lang: string) => {
  const isCaseProgressionEnabled = await isCaseProgressionV1Enable();
  const isCoSCEnabledValue = await isCoSCEnabled();
  const isJoLiveValue = await isJudgmentOnlineLive();
  const defendantDocumentsArray: DocumentInformation[] = [];
  defendantDocumentsArray.push(...getDefendantResponse(claim, claimId, lang));
  defendantDocumentsArray.push(...getDefendantDirectionQuestionnaire(claim, claimId, lang));
  defendantDocumentsArray.push(...getDefendantRequestForReconsideration(claim, claimId, lang));
  if (isCaseProgressionEnabled) {
    defendantDocumentsArray.push(...getTrialArrangementsDocument(claim, claimId, lang, false));
  }
  if(isJoLiveValue) {
    defendantDocumentsArray.push(...getJBADefendantDocument(claim, claimId, lang));
    defendantDocumentsArray.push(...getDJDefendantDocument(claim, claimId, lang));
  }
  // Documents for LR only
  defendantDocumentsArray.push(...getDefendantSupportDocument(claim, claimId, lang));
  if(isCoSCEnabledValue) {
    defendantDocumentsArray.push(...getCoSCDocument(claim, claimId, lang));
  }
  return new DocumentsViewComponent('Defendant', defendantDocumentsArray);
};

export const getCourtDocuments = async (claim: Claim, claimId: string, lang: string) => {
  const isCaseProgressionEnabled = await isCaseProgressionV1Enable();
  const isCaseworkerEventsEnabled = await isCaseWorkerEventsEnabled();
  const courtDocumentsArray: DocumentInformation[] = [];

  if (isCaseworkerEventsEnabled) {
    courtDocumentsArray.push(...getCourtOfficerOrder(claim, claimId, lang));
  }

  courtDocumentsArray.push(...getStandardDirectionsOrder(claim, claimId, lang));
  courtDocumentsArray.push(...getManualDetermination(claim, claimId, lang));
  courtDocumentsArray.push(...getCcjRequestAdmission(claim, claimId, lang));
  courtDocumentsArray.push(...getInterlocutoryJudgement(claim, claimId, lang));
  courtDocumentsArray.push(...getCcjRequestDetermination(claim, claimId, lang));
  courtDocumentsArray.push(...getSettlementAgreement(claim, claimId, lang));

  if (isCaseProgressionEnabled) {
    courtDocumentsArray.push(...getDecisionOnReconsideration(claim, claimId, lang));
    courtDocumentsArray.push(...getTranslatedOrders(claim, claimId, lang));
    courtDocumentsArray.push(...getFinalOrders(claim, claimId, lang));
  }

  if (await isGaForLipsEnabled()) {
    courtDocumentsArray.push(...getGeneralApplicationOrders(claim, claimId, lang));
  }

  return new DocumentsViewComponent('CourtDocument', courtDocumentsArray);
};

const getGeneralApplicationOrders = (claim: Claim, claimId: string, lang: string) => {
  let documents;
  if (claim.isClaimant()) {
    documents = claim.generalOrderDocClaimant;
  } else {
    documents = claim.generalOrderDocRespondentSol;
  }
  const caseDocuments: DocumentInformation[] = [];
  if (documents && documents.length > 0) {
    documents.forEach((documentElement) => {
      const document = documentElement.value;
      caseDocuments.push(setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lang, 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.GENERAL_ORDER'));
    });
  }
  return caseDocuments;
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

const getTrialArrangementsDocument = (claim: Claim, claimId: string, lang: string, isClaimant: boolean) => {
  const trialArrangementsDocument = isClaimant
    ? claim?.caseProgression?.claimantTrialArrangements?.trialArrangementsDocument
    : claim?.caseProgression?.defendantTrialArrangements?.trialArrangementsDocument;
  return trialArrangementsDocument ? Array.of(setUpDocumentLinkObject(
    trialArrangementsDocument.value?.documentLink, trialArrangementsDocument.value?.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.TRIAL_ARRANGEMENTS')) : [];
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
  const standardDirectionsOrders = claim.getDocumentDetailsList(DocumentType.SDO_ORDER);

  const caseDocuments: DocumentInformation[] = [];
  if (standardDirectionsOrders && standardDirectionsOrders.length > 0) {
    standardDirectionsOrders.forEach((documentElement) => {
      const document = documentElement.value;
      caseDocuments.push(setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.STANDARD_DIRECTIONS_ORDER'));
    });
  }
  return caseDocuments;
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

const getCoSCDocument = (claim: Claim, claimId: string, lang: string) => {
  const coscDoc = claim.getDocumentDetails(DocumentType.CERTIFICATE_OF_DEBT_PAYMENT);
  return coscDoc ? Array.of(
    setUpDocumentLinkObject(coscDoc.documentLink, coscDoc.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.COSC')) : [];
};

const getJBADefendantDocument = (claim: Claim, claimId: string, lang: string) => {
  const jbaDoc = claim.getDocumentDetails(DocumentType.JUDGMENT_BY_ADMISSION_DEFENDANT);
  return jbaDoc ? Array.of(
    setUpDocumentLinkObject(jbaDoc.documentLink, jbaDoc.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.JBA_DEFENDANT')) : [];
};

const getJBAClaimantDocument = (claim: Claim, claimId: string, lang: string) => {
  const jbaDoc = claim.getDocumentDetails(DocumentType.JUDGMENT_BY_ADMISSION_CLAIMANT);
  return jbaDoc ? Array.of(
    setUpDocumentLinkObject(jbaDoc.documentLink, jbaDoc.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.JBA_CLAIMANT')) : [];
};

const getDJDefendantDocument = (claim: Claim, claimId: string, lang: string) => {
  const djDoc = claim.getDocumentDetails(DocumentType.DEFAULT_JUDGMENT_DEFENDANT1);
  return djDoc ? Array.of(
    setUpDocumentLinkObject(djDoc.documentLink, djDoc.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DJ_DEFENDANT')) : [];
};

const getDJClaimantDocument = (claim: Claim, claimId: string, lang: string) => {
  const djDoc = claim.getDocumentDetails(DocumentType.DEFAULT_JUDGMENT_CLAIMANT1);
  return djDoc ? Array.of(
    setUpDocumentLinkObject(djDoc.documentLink, djDoc.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DJ_CLAIMANT')) : [];
};

const getClaimantRequestForReconsideration = (claim: Claim, claimId: string, lang: string) => {
  const document = claim.caseProgression?.requestForReconsiderationDocument;
  return document ? Array.of(
    setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lang, 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT')) : [];
};

const getDefendantRequestForReconsideration = (claim: Claim, claimId: string, lang: string) => {
  const document = claim.caseProgression?.requestForReconsiderationDocumentRes;
  return document ? Array.of(
    setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lang, 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT')) : [];
};

const getTranslatedOrders = (claim: Claim, claimId: string, lang: string) => {
  const documents = claim.getDocumentDetailsList(DocumentType.ORDER_NOTICE_TRANSLATED_DOCUMENT);
  const caseDocuments: DocumentInformation[] = [];
  if (documents && documents.length > 0) {
    documents.forEach((documentElement) => {
      const document = documentElement.value;
      caseDocuments.push(setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.TRANSLATED_ORDER'));
    });
  }
  return caseDocuments;
};

const getDecisionOnReconsideration = (claim: Claim, claimId: string, lang: string) => {
  const settlementAgreement = claim.getDocumentDetails(DocumentType.DECISION_MADE_ON_APPLICATIONS);
  return settlementAgreement ? Array.of(
    setUpDocumentLinkObject(settlementAgreement.documentLink, settlementAgreement.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DECISION_ON_RECONSIDERATION')) : [];
};

const getFinalOrders = (claim: Claim, claimId: string, lang: string) => {
  const documents = claim.caseProgression?.finalOrderDocumentCollection;
  const caseDocuments: DocumentInformation[] = [];
  if (documents && documents.length > 0) {
    documents.forEach((documentElement) => {
      const document = documentElement.value;
      caseDocuments.push(setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.FINAL_ORDER'));
    });
  }
  return caseDocuments;
};

const getCourtOfficerOrder = (claim: Claim, claimId: string, lang: string) => {
  const document = claim.caseProgression?.courtOfficerOrder;
  const caseDocuments: DocumentInformation[] = [];
  if (document) {
    caseDocuments.push(setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.COURT_OFFICER_ORDER'));
  }
  return caseDocuments;
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
