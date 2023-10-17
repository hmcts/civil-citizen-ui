import {Claim} from 'models/claim';
import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty, toCUIPartyRespondent} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';
import {toCUIClaimBilingualLangPreference} from 'services/translation/convertToCUI/convertToCUIRespondentLiPResponse';
import {toCUIRejectAllOfClaim} from 'services/translation/convertToCUI/convertToCUIRejectAllOfClaim';
import {toCUIDQs} from 'services/translation/convertToCUI/convertToCUIDQs';
import {toCUIFullAdmission} from 'services/translation/convertToCUI/convertToCUIFullAdmission';
import {toCUIPartialAdmission, toCUIPaymentOption} from './convertToCUIPartialAdmission';
import {toCUICaseProgressionHearing} from 'services/translation/convertToCUI/convertToCaseProgressionHearing';
import {DocumentType} from 'models/document/documentType';
import {toCUICaseProgression} from 'services/translation/convertToCUI/convertToCUICaseProgression';
import {toCUIGenericYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {ClaimantResponse} from 'models/claimantResponse';
import {toCUICCJRequest} from 'services/translation/convertToCUI/convertToCUICCJRequest';
import {PaymentIntention} from 'form/models/admission/paymentIntention';

export const translateCCDCaseDataToCUIModel = (ccdClaimObj: CCDClaim): Claim => {
  const claim: Claim = Object.assign(new Claim(), ccdClaimObj);
  const ccdClaim: CCDClaim = Object.assign({}, ccdClaimObj);

  const claimantResponse: ClaimantResponse = new ClaimantResponse();
  claimantResponse.suggestedPaymentIntention = new PaymentIntention();
  claim.claimDetails = toCUIClaimDetails(ccdClaim);
  claim.evidence = toCUIEvidence(ccdClaim.specResponselistYourEvidenceList, ccdClaim.respondent1LiPResponse?.evidenceComment);
  claim.applicant1 = toCUIParty(ccdClaim.applicant1);
  claim.respondent1 = toCUIPartyRespondent(ccdClaim.respondent1, ccdClaim.respondent1LiPResponse);
  claim.respondent1.responseType = ccdClaim.respondent1ClaimResponseTypeForSpec;
  claim.mediation = toCUIMediation(ccdClaim.respondent1LiPResponse?.respondent1MediationLiPResponse);
  claim.statementOfMeans = toCUIStatementOfMeans(ccdClaim);
  claim.claimBilingualLanguagePreference = toCUIClaimBilingualLangPreference(ccdClaim.respondent1LiPResponse?.respondent1ResponseLanguage);
  claim.rejectAllOfClaim = toCUIRejectAllOfClaim(ccdClaim);
  claim.directionQuestionnaire = toCUIDQs(ccdClaim);
  claim.sdoOrderDocument = ccdClaim.systemGeneratedCaseDocuments?.find((documents) => documents.value.documentType === DocumentType.SDO_ORDER);
  claim.caseProgressionHearing = toCUICaseProgressionHearing(ccdClaim);
  claim.caseProgression = toCUICaseProgression(ccdClaim);
  claim.specClaimTemplateDocumentFiles = ccdClaim.servedDocumentFiles?.timelineEventUpload ? ccdClaim.servedDocumentFiles.timelineEventUpload[0].value : undefined;

  if (claim.isFullAdmission()) {
    translateFullAdmission(claim, ccdClaim, claimantResponse);
  } else if (claim.isPartialAdmission()) {
    translatePartialAdmission(claim, ccdClaim, claimantResponse);
  } else if (claim.isFullDefence()) {
    translateFullDefence(ccdClaim, claimantResponse);
  }

  if (ccdClaim.partialPayment) {
    claimantResponse.ccjRequest = toCUICCJRequest(ccdClaim);
  }

  claimantResponse.hasDefendantPaidYou = toCUIGenericYesNo(ccdClaim.applicant1PartAdmitConfirmAmountPaidSpec);
  claim.claimantResponse = claimantResponse;
  claim.caseRole = ccdClaim.caseRole;
  claim.claimantResponse.suggestedPaymentIntention.paymentOption = toCUIPaymentOption(ccdClaim.applicant1RepaymentOptionForDefendantSpec);

  return claim;
};

function translateFullAdmission(claim: Claim, ccdClaim: CCDClaim, claimantResponse: ClaimantResponse): void {
  claim.fullAdmission = toCUIFullAdmission(ccdClaim);
  claimantResponse.fullAdmitSetDateAcceptPayment = toCUIGenericYesNo(ccdClaim.applicant1AcceptFullAdmitPaymentPlanSpec);
}

function translatePartialAdmission(claim: Claim, ccdClaim: CCDClaim, claimantResponse: ClaimantResponse): void {
  claim.partialAdmission = toCUIPartialAdmission(ccdClaim);
  claimantResponse.fullAdmitSetDateAcceptPayment = toCUIGenericYesNo(ccdClaim.applicant1AcceptPartAdmitPaymentPlanSpec);
  claimantResponse.hasPartAdmittedBeenAccepted = toCUIGenericYesNo(ccdClaim.applicant1PartAdmitIntentionToSettleClaimSpec);
}

function translateFullDefence(ccdClaim: CCDClaim, claimantResponse: ClaimantResponse): void {
  claimantResponse.intentionToProceed = toCUIGenericYesNo(ccdClaim.applicant1ProceedWithClaim);
}

