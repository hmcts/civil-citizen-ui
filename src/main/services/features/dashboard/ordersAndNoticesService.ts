import { Claim } from 'models/claim';
import { DocumentType } from 'models/document/documentType';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { CASE_DOCUMENT_VIEW_URL } from 'routes/urls';
import { DirectionQuestionnaireType } from 'models/directionsQuestionnaire/directionQuestionnaireType';
import { ClaimBilingualLanguagePreference } from 'models/claimBilingualLanguagePreference';
import { Document } from 'models/document/document';
import { documentIdExtractor } from 'common/utils/stringUtils';
import {
  isCaseWorkerEventsEnabled,
  isGaForLipsEnabled,
  isWelshEnabledForMainCase,
  isJudgmentOnlineLive,
} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {YesNoUpperCase} from 'form/models/yesNo';
import {t} from 'i18next';

export const getClaimantDocuments = async (
  claim: Claim,
  claimId: string,
  lang: string,
) => {
  const isCUIWelshEnabled = await isWelshEnabledForMainCase();

  const claimantDocumentsArray: DocumentInformation[] = [];
  if (isCUIWelshEnabled) {
    claimantDocumentsArray.push(...getClaimantDQ(claim, claimId, lang));
    claimantDocumentsArray.push(
      ...getClaimantTranslatedDQ(claim, claimId, lang),
    );
    claimantDocumentsArray.push(
      ...getClaimantSealedClaimForm(claim, claimId, lang),
    );
    claimantDocumentsArray.push(
      ...getClaimantTranslatedSealedClaimForm(claim, claimId, lang),
    );
  } else {
    claimantDocumentsArray.push(
      ...getClaimantDirectionQuestionnaire(claim, claimId, lang),
    );
    claimantDocumentsArray.push(
      ...getClaimantSealClaimForm(claim, claimId, lang),
    );
  }
  claimantDocumentsArray.push(
    ...getClaimantRequestForReconsideration(claim, claimId, lang),
  );

  if (claim.isClaimant()) {
    claimantDocumentsArray.push(
      ...getClaimantUnsealClaimForm(claim, claimId, lang),
    );
    claimantDocumentsArray.push(...getClaimantDraftClaim(claim, claimId, lang));
  }
  claimantDocumentsArray.push(
    ...getTrialArrangementsDocument(claim, claimId, lang, true),
  );
  // Documents for LR only
  claimantDocumentsArray.push(
    ...getClaimantParticularsOfClaim(claim, claimId, lang),
  );
  claimantDocumentsArray.push(
    ...getClaimantTimelineEventsDocument(claim, claimId, lang),
  );
  claimantDocumentsArray.push(
    ...getClaimantResponseToDefenceDocument(claim, claimId, lang),
  );
  return new DocumentsViewComponent('Claimant', claimantDocumentsArray);
};

export const getDefendantDocuments = async (claim: Claim, claimId: string, lang: string) => {
  const isCUIWelshEnabled = await isWelshEnabledForMainCase();

  const defendantDocumentsArray: DocumentInformation[] = [];
  if (isCUIWelshEnabled) {
    defendantDocumentsArray.push(...getDefendantResponseFrom(claim, claimId, lang));
    defendantDocumentsArray.push(...getDefendantTranslatedResponse(claim, claimId, lang));
    defendantDocumentsArray.push(...getDefendantNoticeOfDiscontinuanceDoc(claim, claimId, lang));
    defendantDocumentsArray.push(...getDefendantNoticeOfDiscontinuanceTranslatedDoc(claim, claimId, lang));
  } else {
    defendantDocumentsArray.push(...getDefendantResponse(claim, claimId, lang));
  }
  defendantDocumentsArray.push(...getDefendantDirectionQuestionnaire(claim, claimId, lang));
  defendantDocumentsArray.push(...getDefendantRequestForReconsideration(claim, claimId, lang));
  defendantDocumentsArray.push(...getTrialArrangementsDocument(claim, claimId, lang, false));
  // Documents for LR only
  defendantDocumentsArray.push(...getDefendantSupportDocument(claim, claimId, lang));
  defendantDocumentsArray.push(...getCoSCDocument(claim, claimId, lang));
  return new DocumentsViewComponent('Defendant', defendantDocumentsArray);
};

export const getCourtDocuments = async (claim: Claim, claimId: string, lang: string) => {
  const isCaseworkerEventsEnabled = await isCaseWorkerEventsEnabled();
  const isJudgmentOnlineEnabled = await isJudgmentOnlineLive();

  const courtDocumentsArray: DocumentInformation[] = [];

  if (isCaseworkerEventsEnabled) {
    courtDocumentsArray.push(...getCourtOfficerOrder(claim, claimId, lang));
  }

  courtDocumentsArray.push(...getStandardDirectionsOrder(claim, claimId, lang));
  courtDocumentsArray.push(...getManualDetermination(claim, claimId, lang));
  if (!isJudgmentOnlineEnabled) {
    courtDocumentsArray.push(...getCcjRequestAdmission(claim, claimId, lang));
  }
  courtDocumentsArray.push(...getInterlocutoryJudgement(claim, claimId, lang));
  courtDocumentsArray.push(...getCcjRequestDetermination(claim, claimId, lang));
  courtDocumentsArray.push(...getSettlementAgreement(claim, claimId, lang));

  courtDocumentsArray.push(...getDecisionOnReconsideration(claim, claimId, lang));
  courtDocumentsArray.push(...getTranslatedOrders(claim, claimId, lang));
  courtDocumentsArray.push(...getFinalOrders(claim, claimId, lang));

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
  const originalClaimantDq = (!isBilingual(claim.claimantBilingualLanguagePreference) || claim.isLRDefendant()) ?
    claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT) : undefined;
  let claimantDq = isBilingual(claim.claimantBilingualLanguagePreference) ?
    claim.getDocumentDetails(DocumentType.CLAIMANT_INTENTION_TRANSLATED_DOCUMENT) :
    claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT);
  claimantDq = claimantDq || originalClaimantDq;
  return claimantDq ? Array.of(
    setUpDocumentLinkObject(claimantDq.documentLink, claimantDq.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CLAIMANT_DQ')) : [];
};

const getClaimantDQ = (claim: Claim, claimId: string, lang: string) => {
  const claimantDq =  claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT);
  return claimantDq ? Array.of(
    setUpDocumentLinkObject(claimantDq.documentLink, claimantDq.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CLAIMANT_DQ')) : [];
};

const getClaimantTranslatedDQ = (claim: Claim, claimId: string, lang: string) => {
  const translatedClaimantDq = claim.getDocumentDetails(DocumentType.CLAIMANT_INTENTION_TRANSLATED_DOCUMENT);
  return translatedClaimantDq ? Array.of(
    setUpDocumentLinkObject(translatedClaimantDq.documentLink, translatedClaimantDq.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.TRANSLATED_CLAIMANT_DQ')) : [];
};

const getClaimantSealClaimForm = (claim: Claim, claimId: string, lang: string) => {
  const claimantSealClaim = isBilingual(claim.claimantBilingualLanguagePreference) ?
    claim.getDocumentDetails(DocumentType.CLAIM_ISSUE_TRANSLATED_DOCUMENT) :
    claim.getDocumentDetails(DocumentType.SEALED_CLAIM, DirectionQuestionnaireType.CLAIMANT);
  return claimantSealClaim ? Array.of(
    setUpDocumentLinkObject(claimantSealClaim.documentLink, claimantSealClaim.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.SEALED_CLAIM')) : [];
};

const getClaimantSealedClaimForm = (claim: Claim, claimId: string, lang: string) => {
  const claimantSealClaim = claim.getDocumentDetails(DocumentType.SEALED_CLAIM, DirectionQuestionnaireType.CLAIMANT);
  return claimantSealClaim ? Array.of(
    setUpDocumentLinkObject(claimantSealClaim.documentLink, claimantSealClaim.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.SEALED_CLAIM')) : [];
};

const getClaimantTranslatedSealedClaimForm = (claim: Claim, claimId: string, lang: string) => {
  const translatedClaimantSealClaim = claim.getDocumentDetails(DocumentType.CLAIM_ISSUE_TRANSLATED_DOCUMENT);
  return translatedClaimantSealClaim ? Array.of(
    setUpDocumentLinkObject(translatedClaimantSealClaim.documentLink, translatedClaimantSealClaim.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.TRANSLATED_SEALED_CLAIM')) : [];
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
      claim.getDocumentDetails(DocumentType.SEALED_CLAIM, DirectionQuestionnaireType.DEFENDANT) ?? claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE) :
      isBilingual(claim.claimBilingualLanguagePreference) ?
        claim.getDocumentDetails(DocumentType.DEFENCE_TRANSLATED_DOCUMENT) :
        claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE);
  return defendResponse ? Array.of(
    setUpDocumentLinkObject(defendResponse.documentLink, defendResponse.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE')) : [];
};

const getDefendantResponseFrom = (claim: Claim, claimId: string, lang: string) => {
  const defendResponse =
    claim.isLRDefendant()
      ? claim.getDocumentDetails(DocumentType.SEALED_CLAIM, DirectionQuestionnaireType.DEFENDANT) ?? claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE)
      : claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE);
  return defendResponse ? Array.of(
    setUpDocumentLinkObject(defendResponse.documentLink, defendResponse.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE')) : [];
};

const getDefendantTranslatedResponse = (claim: Claim, claimId: string, lang: string) => {
  const defendTranslatedResponse = claim.getDocumentDetails(DocumentType.DEFENCE_TRANSLATED_DOCUMENT);
  return defendTranslatedResponse ? Array.of(
    setUpDocumentLinkObject(defendTranslatedResponse.documentLink, defendTranslatedResponse.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.TRANSLATED_DEFENDANT_RESPONSE')) : [];
};

const getDefendantNoticeOfDiscontinuanceDoc = (claim: Claim, claimId: string, lang: string) => {
  const defendantNoticeOfDiscontinuance = claim.getDocumentDetails(DocumentType.NOTICE_OF_DISCONTINUANCE_DEFENDANT);
  return defendantNoticeOfDiscontinuance && (claim.confirmOrderGivesPermission === YesNoUpperCase.YES || claim.courtPermissionNeeded === YesNoUpperCase.NO) ? Array.of(
    setUpDocumentLinkObject(defendantNoticeOfDiscontinuance.documentLink, defendantNoticeOfDiscontinuance.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.NOTICE_OF_DISCONTINUANCE')) : [];
};

const getDefendantNoticeOfDiscontinuanceTranslatedDoc = (claim: Claim, claimId: string, lang: string) => {
  const defendantNoticeOfDiscontinuanceTranslated = claim.getDocumentDetails(DocumentType.NOTICE_OF_DISCONTINUANCE_DEFENDANT_TRANSLATED_DOCUMENT);
  return defendantNoticeOfDiscontinuanceTranslated && (claim.confirmOrderGivesPermission === YesNoUpperCase.YES || claim.courtPermissionNeeded === YesNoUpperCase.NO) ? Array.of(
    setUpDocumentLinkObject(defendantNoticeOfDiscontinuanceTranslated.documentLink, defendantNoticeOfDiscontinuanceTranslated.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.NOTICE_OF_DISCONTINUANCE_TRANSLATED')) : [];
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
  const standardDirectionOrder = claim.getDocumentDetails(DocumentType.SDO_ORDER);
  const docLink1 =  standardDirectionOrder ?
    setUpDocumentLinkObject(standardDirectionOrder.documentLink, standardDirectionOrder.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.STANDARD_DIRECTIONS_ORDER') : undefined;
  const translatedSdo = claim.getDocumentDetails(DocumentType.SDO_TRANSLATED_DOCUMENT);
  const docLink2 = translatedSdo
    ? setUpDocumentLinkObject(translatedSdo.documentLink, translatedSdo.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.TRANSLATED_STANDARD_DIRECTIONS_ORDER')
    : undefined;
  return [docLink1, docLink2].filter(item => !!item);
};

const getManualDetermination = (claim: Claim, claimId: string, lang: string) => {
  const manualDetermination = claim.getDocumentDetails(DocumentType.LIP_MANUAL_DETERMINATION);
  const docLink1 =  manualDetermination ?
    setUpDocumentLinkObject(manualDetermination.documentLink, manualDetermination.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DETERMINATION_REQUEST') : undefined;
  const translatedManualDetermination = claim.getDocumentDetails(DocumentType.MANUAL_DETERMINATION_TRANSLATED_DOCUMENT);
  const docLink2 = translatedManualDetermination
    ? setUpDocumentLinkObject(translatedManualDetermination.documentLink, translatedManualDetermination.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.TRANSLATED_DETERMINATION_REQUEST')
    : undefined;
  return [docLink1, docLink2].filter(item => !!item);
};

const getCcjRequestAdmission = (claim: Claim, claimId: string, lang: string) => {
  const ccjRequestAdmission = claim.getDocumentDetails(DocumentType.CCJ_REQUEST_ADMISSION);
  return ccjRequestAdmission ? Array.of(
    setUpDocumentLinkObject(ccjRequestAdmission.documentLink, ccjRequestAdmission.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CCJ_REQUEST')) : [];
};

const getInterlocutoryJudgement = (claim: Claim, claimId: string, lang: string) => {
  const interlocutoryJudgement = claim.getDocumentDetails(DocumentType.INTERLOCUTORY_JUDGEMENT);
  const docLink1 = interlocutoryJudgement
    ? setUpDocumentLinkObject(interlocutoryJudgement.documentLink, interlocutoryJudgement.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CLAIMANT_RESPONSE_RECEIPT')
    : undefined;
  const translatedInterlocutoryJudgement = claim.getDocumentDetails(DocumentType.INTERLOC_JUDGMENT_TRANSLATED_DOCUMENT);
  const docLink2 = translatedInterlocutoryJudgement
    ? setUpDocumentLinkObject(translatedInterlocutoryJudgement.documentLink, translatedInterlocutoryJudgement.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.TRANSLATED_CLAIMANT_RESPONSE_RECEIPT')
    : undefined;
  return [docLink1, docLink2].filter(item => !!item);
};

const getCcjRequestDetermination = (claim: Claim, claimId: string, lang: string) => {
  const ccjRequestDetermination = claim.getDocumentDetails(DocumentType.CCJ_REQUEST_DETERMINATION);
  return ccjRequestDetermination ? Array.of(
    setUpDocumentLinkObject(ccjRequestDetermination.documentLink, ccjRequestDetermination.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.CCJ_REQUEST')) : [];
};

const getSettlementAgreement = (claim: Claim, claimId: string, lang: string) => {
  const settlementAgreement = claim.getDocumentDetails(DocumentType.SETTLEMENT_AGREEMENT);
  const docLink1 = settlementAgreement
    ? setUpDocumentLinkObject(settlementAgreement.documentLink, settlementAgreement.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.SETTLEMENT_AGREEMENT')
    : undefined;
  const translatedSettlementAgreement = claim.getDocumentDetails(DocumentType.SETTLEMENT_AGREEMENT_TRANSLATED_DOCUMENT);
  const docLink2 = translatedSettlementAgreement
    ? setUpDocumentLinkObject(translatedSettlementAgreement.documentLink, translatedSettlementAgreement.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.TRANSLATED_SETTLEMENT_AGREEMENT')
    : undefined;
  return [docLink1, docLink2].filter(item => !!item);
};

const getCoSCDocument = (claim: Claim, claimId: string, lang: string) => {
  const coscDoc = claim.getDocumentDetails(DocumentType.CERTIFICATE_OF_DEBT_PAYMENT);
  return coscDoc ? Array.of(
    setUpDocumentLinkObject(coscDoc.documentLink, coscDoc.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.COSC')) : [];
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

  const decisionOnReconsideration = claim.getDocumentDetails(DocumentType.DECISION_MADE_ON_APPLICATIONS);
  const docLink1 = decisionOnReconsideration
    ? setUpDocumentLinkObject(decisionOnReconsideration.documentLink, decisionOnReconsideration.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DECISION_ON_RECONSIDERATION')
    : undefined;
  const translatedDecisionOnReconsideration = claim.getDocumentDetails(DocumentType.DECISION_MADE_ON_APPLICATIONS_TRANSLATED);
  const docLink2 = translatedDecisionOnReconsideration
    ? setUpDocumentLinkObject(translatedDecisionOnReconsideration.documentLink, translatedDecisionOnReconsideration.createdDatetime, claimId, lang, 'PAGES.ORDERS_AND_NOTICES.DECISION_ON_RECONSIDERATION_TRANSLATED')
    : undefined;
  return [docLink1, docLink2].filter(item => !!item);

};

const getFinalOrders = (claim: Claim, claimId: string, lang: string) => {
  const documents = claim.caseProgression?.finalOrderDocumentCollection;
  const caseDocuments: DocumentInformation[] = [];
  if (documents && documents.length > 0) {
    documents.forEach((documentElement) => {
      const document = documentElement.value;
      const documentLabel = document.documentType === DocumentType.FINAL_ORDER_TRANSLATED_DOCUMENT
        ? 'PAGES.ORDERS_AND_NOTICES.TRANSLATED_FINAL_ORDER'
        : 'PAGES.ORDERS_AND_NOTICES.FINAL_ORDER';
      caseDocuments.push(setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lang, documentLabel));
    });
  }
  return caseDocuments;
};

const getCourtOfficerOrder = (claim: Claim, claimId: string, lng: string) => {
  const document = claim.caseProgression?.courtOfficerOrder;
  const courtOfficerOrder = claim.caseProgression?.courtOfficersOrders;
  const caseDocuments: DocumentInformation[] = [];

  if (!document && (courtOfficerOrder && courtOfficerOrder.length > 0)) {
    courtOfficerOrder.forEach((documentElement) => {
      const document = documentElement.value;
      const documentLabel = document.documentType === DocumentType.COURT_OFFICER_ORDER_TRANSLATED_DOCUMENT
        ? t('PAGES.ORDERS_AND_NOTICES.TRANSLATED_COURT_OFFICER_ORDER', {lng})
        : t('PAGES.ORDERS_AND_NOTICES.COURT_OFFICER_ORDER', {lng});
      caseDocuments.push(setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lng, documentLabel));
    });
  } else if (document) {
    caseDocuments.push(setUpDocumentLinkObject(document.documentLink, document.createdDatetime, claimId, lng, 'PAGES.ORDERS_AND_NOTICES.COURT_OFFICER_ORDER'));
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
  return languagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
};
