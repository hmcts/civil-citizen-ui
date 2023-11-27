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
import {toCUICCJRequest, toCUIChoosesHowToProceed} from 'services/translation/convertToCUI/convertToCUICCJRequest';
import { Interest } from 'common/form/models/interest/interest';
import { InterestClaimOptionsType } from 'common/form/models/claim/interest/interestClaimOptionsType';
import { InterestEndDateType, SameRateInterestType } from 'common/form/models/claimDetails';
import { InterestStartDate } from 'common/form/models/interest/interestStartDate';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';

export const translateCCDCaseDataToCUIModel = (ccdClaimObj: CCDClaim): Claim => {
  const claim: Claim = Object.assign(new Claim(), ccdClaimObj);
  const ccdClaim: CCDClaim = Object.assign({}, ccdClaimObj);
  const claimantResponse: ClaimantResponse = new ClaimantResponse();
  claimantResponse.suggestedPaymentIntention = new PaymentIntention();
  claimantResponse.chooseHowToProceed = new ChooseHowToProceed();
  claim.claimDetails = toCUIClaimDetails(ccdClaim);
  claim.evidence = toCUIEvidence(ccdClaim.specResponselistYourEvidenceList, ccdClaim.respondent1LiPResponse?.evidenceComment);
  claim.applicant1 = toCUIParty(ccdClaim.applicant1);
  claim.respondent1 = toCUIPartyRespondent(ccdClaim.respondent1,ccdClaim.respondent1LiPResponse);
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
  claim.specClaimTemplateDocumentFiles = ccdClaim.servedDocumentFiles?.timelineEventUpload ? ccdClaim.servedDocumentFiles.timelineEventUpload[0].value : undefined;
  claim.caseRole = ccdClaim.caseRole;
  claim.interest = claim?.interest ? claim?.interest : translateCCDInterestDetailsToCUI(ccdClaim);
  claim.respondentPaymentDeadline = ccdClaim.respondToClaimAdmitPartLRspec?.whenWillThisAmountBePaid ? ccdClaim.respondToClaimAdmitPartLRspec.whenWillThisAmountBePaid : undefined;

  if (claim.isFullAdmission()) {
    translateFullAdmission(claim, ccdClaim, claimantResponse);
  } else if (claim.isPartialAdmission()) {
    translatePartialAdmission(claim, ccdClaim, claimantResponse);
  } else if (claim.isFullDefence()) {
    translateFullDefence(ccdClaim, claimantResponse);
  }

  if(ccdClaim.partialPayment){
    claimantResponse.ccjRequest = toCUICCJRequest(ccdClaim);
  }
  claimantResponse.submittedDate = ccdClaim?.applicant1ResponseDate;
  claimantResponse.hasDefendantPaidYou = toCUIGenericYesNo(ccdClaim.applicant1PartAdmitConfirmAmountPaidSpec);
  claim.claimantResponse = claimantResponse;
  claim.claimantResponse.suggestedPaymentIntention.paymentOption = toCUIPaymentOption(ccdClaim.applicant1RepaymentOptionForDefendantSpec);
  claim.claimantResponse.chooseHowToProceed.option = toCUIChoosesHowToProceed[ccdClaim.applicant1LiPResponse?.applicant1ChoosesHowToProceed];
  claim.claimantResponse.suggestedPaymentIntention.paymentOption = toCUIPaymentOption(ccdClaim.applicant1RepaymentOptionForDefendantSpec);

  return claim;
};

const translateCCDInterestDetailsToCUI = (ccdClaim: CCDClaim) => {
  const interest = new Interest();
  interest.interestClaimFrom = ccdClaim?.interestClaimFrom;
  interest.interestClaimOptions = InterestClaimOptionsType[ccdClaim?.interestClaimOptions];
  interest.interestEndDate = InterestEndDateType[ccdClaim?.interestClaimUntil];
  if (ccdClaim?.interestFromSpecificDate) {
    const ccdInterestDate = new Date(ccdClaim?.interestFromSpecificDate);
    interest.interestStartDate = new InterestStartDate((ccdInterestDate.getDay() + 1).toString(), (ccdInterestDate.getMonth() + 1).toString(), ccdInterestDate.getFullYear().toString(), ccdClaim?.interestFromSpecificDateDescription);
  }
  interest.sameRateInterestSelection = {
    sameRateInterestType: SameRateInterestType[ccdClaim?.sameRateInterestSelection?.sameRateInterestType],
    differentRate: ccdClaim?.sameRateInterestSelection?.differentRate,
    reason: ccdClaim?.sameRateInterestSelection?.differentRateReason,
  };
  return interest;
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
