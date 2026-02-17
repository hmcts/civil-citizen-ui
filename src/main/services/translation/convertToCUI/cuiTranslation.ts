import {Claim} from 'models/claim';
import {CCDClaim, RespondentSolGaAppDetail} from 'models/civilClaimResponse';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty, toCUIPartyRespondent} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';
import {toCUIClaimBilingualLangPreference} from 'services/translation/convertToCUI/convertToCUIRespondentLiPResponse';
import {toCUIRejectAllOfClaim} from 'services/translation/convertToCUI/convertToCUIRejectAllOfClaim';
import {toCUIDQs} from 'services/translation/convertToCUI/convertToCUIDQs';
import {toCUIFullAdmission} from 'services/translation/convertToCUI/convertToCUIFullAdmission';
import {toCUIPartialAdmission, toCUIRepaymentPlanFrequency} from './convertToCUIPartialAdmission';
import {toCUICaseProgressionHearing} from 'services/translation/convertToCUI/convertToCaseProgressionHearing';
import {DocumentType} from 'models/document/documentType';
import {toCUICaseProgression} from 'services/translation/convertToCUI/convertToCUICaseProgression';
import {
  toCUIGenericYesNo,
  toCUIYesNo,
} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {ClaimantResponse} from 'models/claimantResponse';
import {
  toCUICCJRequest,
  toCUIChoosesHowToProceed,
  toCUIClaimantPaymentOption,
} from 'services/translation/convertToCUI/convertToCUICCJRequest';
import { Interest } from 'common/form/models/interest/interest';
import { InterestClaimOptionsType } from 'common/form/models/claim/interest/interestClaimOptionsType';
import { InterestEndDateType, SameRateInterestType } from 'common/form/models/claimDetails';
import { InterestStartDate } from 'common/form/models/interest/interestStartDate';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {toCUIMediationCarm} from 'services/translation/convertToCUI/convertToCUIMediationCarm';
import {CourtProposedPlan, CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';
import {CourtProposedDate, CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import { TotalInterest } from 'common/form/models/interest/totalInterest';
import {toCUIClaimantMediation} from 'services/translation/convertToCUI/convertToCUIClaimantMediation';
import { RepaymentPlan } from 'common/models/repaymentPlan';
import {
  ApplicationTypeOption,
  selectedApplicationTypeByOptions,
} from 'common/models/generalApplication/applicationType';
import {ClaimGeneralApplication, ClaimGeneralApplicationValue} from 'models/generalApplication/claimGeneralApplication';
import {CCDGeneralApplication} from 'models/gaEvents/eventDto';

export const translateCCDCaseDataToCUIModel = (ccdClaimObj: CCDClaim): Claim => {
  const claim: Claim = Object.assign(new Claim(), ccdClaimObj);
  const ccdClaim: CCDClaim = {...ccdClaimObj};
  const claimantResponse: ClaimantResponse = new ClaimantResponse();
  claimantResponse.suggestedPaymentIntention = new PaymentIntention();
  claimantResponse.chooseHowToProceed = new ChooseHowToProceed();
  claim.claimDetails = toCUIClaimDetails(ccdClaim);
  claim.evidence = toCUIEvidence(ccdClaim.specResponselistYourEvidenceList, ccdClaim.respondent1LiPResponse?.evidenceComment);
  claim.claimantEvidence = toCUIEvidence(ccdClaim.speclistYourEvidenceList);
  claim.applicant1 = toCUIParty(ccdClaim.applicant1);
  claim.respondent1 = toCUIPartyRespondent(ccdClaim.respondent1,ccdClaim.respondent1LiPResponse);
  claim.respondent1.responseType = ccdClaim.respondent1ClaimResponseTypeForSpec;
  claim.mediation = toCUIMediation(ccdClaim.respondent1LiPResponse?.respondent1MediationLiPResponse);
  claim.mediationCarm = toCUIMediationCarm(ccdClaim.respondent1LiPResponseCarm);
  claim.statementOfMeans = toCUIStatementOfMeans(ccdClaim);
  claim.claimBilingualLanguagePreference = toCUIClaimBilingualLangPreference(ccdClaim.respondent1LiPResponse?.respondent1ResponseLanguage);
  claim.claimantBilingualLanguagePreference = toCUIClaimBilingualLangPreference(ccdClaim.claimantBilingualLanguagePreference);
  claim.rejectAllOfClaim = toCUIRejectAllOfClaim(ccdClaim);
  claim.directionQuestionnaire = toCUIDQs(ccdClaim);
  claim.claimType = ccdClaim.responseClaimTrack;
  claim.responseClaimTrack = ccdClaim.responseClaimTrack;
  claim.sdoOrderDocument = ccdClaim.systemGeneratedCaseDocuments?.find((documents) => documents.value.documentType === DocumentType.SDO_ORDER);
  claim.caseProgressionHearing = toCUICaseProgressionHearing(ccdClaim);
  claim.caseProgression = toCUICaseProgression(ccdClaim);
  claim.specClaimTemplateDocumentFiles = ccdClaim.servedDocumentFiles?.timelineEventUpload ? ccdClaim.servedDocumentFiles.timelineEventUpload[0].value : undefined;
  claim.specParticularsOfClaimDocumentFiles = ccdClaim.servedDocumentFiles?.particularsOfClaimDocument ? ccdClaim.servedDocumentFiles.particularsOfClaimDocument[0].value : undefined;
  claim.caseRole = ccdClaim.caseRole;
  claim.interest = claim.interest ? claim?.interest : translateCCDInterestDetailsToCUI(ccdClaim);
  claim.respondentPaymentDeadline = ccdClaim.respondToClaimAdmitPartLRspec?.whenWillThisAmountBePaid ? ccdClaim.respondToClaimAdmitPartLRspec.whenWillThisAmountBePaid : undefined;
  claim.res1MediationDocumentsReferred = ccdClaim.res1MediationDocumentsReferred;
  claim.res1MediationNonAttendanceDocs = ccdClaim.res1MediationNonAttendanceDocs;
  claim.claimIssuedHwfDetails = ccdClaim.claimIssuedHwfDetails;
  claim.app1MediationDocumentsReferred = ccdClaim.app1MediationDocumentsReferred;
  claim.app1MediationNonAttendanceDocs = ccdClaim.app1MediationNonAttendanceDocs;
  claim.defendantResponseDocuments = ccdClaim.defendantResponseDocuments;
  claim.responseClaimMediationSpecRequired = toCUIYesNo(ccdClaim.responseClaimMediationSpecRequired);
  claim.defendantResponseTimelineDocument = ccdClaim.specResponseTimelineDocumentFiles;

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
  claimantResponse.mediation = toCUIMediation(ccdClaim.applicant1ClaimMediationSpecRequiredLip);
  claim.claimantResponse = claimantResponse;
  claim.claimantResponse.chooseHowToProceed.option = toCUIChoosesHowToProceed[ccdClaim.applicant1LiPResponse?.applicant1ChoosesHowToProceed];
  claim.caseRole = ccdClaim.caseRole;
  claim.interest = claim?.interest ? claim?.interest : translateCCDInterestDetailsToCUI(ccdClaim);
  claim.claimInterest = toCUIYesNo(ccdClaim.claimInterest);
  claim.claimantResponse.suggestedPaymentIntention.paymentOption = toCUIClaimantPaymentOption(ccdClaim.applicant1RepaymentOptionForDefendantSpec);
  claim.claimantResponse.suggestedPaymentIntention.paymentDate = translateCCDPaymentDateToCUIccd(ccdClaim.applicant1RequestedPaymentDateForDefendantSpec?.paymentSetDate);
  claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = toCUIApplicant1RepaymentPlan(ccdClaim);
  claim.claimantResponse.courtProposedPlan = new CourtProposedPlan();
  claim.claimantResponse.courtProposedDate = new CourtProposedDate();
  claim.claimantResponse.courtProposedPlan.decision = CourtProposedPlanOptions[ccdClaim.applicant1LiPResponse?.claimantResponseOnCourtDecision as CourtProposedPlanOptions];
  claim.claimantResponse.courtProposedDate.decision = CourtProposedDateOptions[ccdClaim.applicant1LiPResponse?.claimantResponseOnCourtDecision as CourtProposedDateOptions];
  claim.claimantResponse.mediation = toCUIClaimantMediation(ccdClaim.applicant1ClaimMediationSpecRequiredLip);
  claim.claimantResponse.courtDecision = ccdClaim.applicant1LiPResponse?.claimantCourtDecision;
  claim.claimantResponse.mediationCarm = toCUIMediationCarm(ccdClaim.applicant1LiPResponseCarm);
  claim.claimantResponse.suggestedImmediatePaymentDeadLine = ccdClaim.applicant1SuggestPayImmediatelyPaymentDateForDefendantSpec;
  claim.claimantResponse.applicant1DefenceResponseDocumentSpec = ccdClaim.applicant1DefenceResponseDocumentSpec;
  claim.claimType = ccdClaim.claimType;
  claim.respondentGaAppDetails = toCUIRespondentGADetails(ccdClaim.respondentSolGaAppDetails);
  claim.generalApplications = toCUIClaimGeneralApplications(ccdClaim.generalApplications);
  claim.joIsLiveJudgmentExists = toCUIGenericYesNo(ccdClaim.joIsLiveJudgmentExists);
  claim.joJudgementByAdmissionIssueDate = ccdClaim.joJudgementByAdmissionIssueDate;
  claim.joDJCreatedDate = ccdClaim.joDJCreatedDate;
  return claim;
};

const translateCCDInterestDetailsToCUI = (ccdClaim: CCDClaim) => {
  const interest = new Interest();
  interest.interestClaimFrom = ccdClaim?.interestClaimFrom;
  interest.interestClaimOptions = InterestClaimOptionsType[ccdClaim?.interestClaimOptions];
  interest.interestEndDate = InterestEndDateType[ccdClaim?.interestClaimUntil];

  if(interest.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST) {
    const totalInterest = new TotalInterest();
    totalInterest.amount = ccdClaim.breakDownInterestTotal;
    totalInterest.reason = ccdClaim.breakDownInterestDescription;
    interest.totalInterest = totalInterest;
  }

  if (ccdClaim?.interestFromSpecificDate) {
    const ccdInterestDate = new Date(ccdClaim?.interestFromSpecificDate);
    interest.interestStartDate = new InterestStartDate((ccdInterestDate.getDate()).toString(), (ccdInterestDate.getMonth() + 1).toString(), ccdInterestDate.getFullYear().toString(), ccdClaim?.interestFromSpecificDateDescription);
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
  claimantResponse.hasPartAdmittedBeenAccepted = toCUIGenericYesNo(ccdClaim.applicant1AcceptAdmitAmountPaidSpec);
}

function translateFullDefence(ccdClaim: CCDClaim, claimantResponse: ClaimantResponse): void {
  claimantResponse.intentionToProceed = toCUIGenericYesNo(ccdClaim.applicant1ProceedWithClaim);
  claimantResponse.hasFullDefenceStatesPaidClaimSettled = toCUIGenericYesNo(ccdClaim.applicant1PartAdmitIntentionToSettleClaimSpec);
}

function translateCCDPaymentDateToCUIccd(paymentDate: string): Date {
  return (paymentDate) ? new Date(paymentDate) : undefined;
}

function toCUIApplicant1RepaymentPlan(ccdClaim: CCDClaim): RepaymentPlan  {
  return {
    paymentAmount : ccdClaim.applicant1SuggestInstalmentsPaymentAmountForDefendantSpec,
    repaymentFrequency : toCUIRepaymentPlanFrequency(ccdClaim.applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec),
    firstRepaymentDate : new Date(ccdClaim.applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec),
  };
}

function toCUIRespondentGADetails(respondentSolGaAppDetails: RespondentSolGaAppDetail[]) {
  return respondentSolGaAppDetails?.map(gaAppInfo => {
    return {
      generalAppTypes: gaAppInfo.value.generalApplicationType.split(',').map((applicationType: string) => displayToEnumKey(applicationType)),
      gaApplicationId: gaAppInfo.value.caseLink.CaseReference,
      caseState: gaAppInfo.value.caseState,
      generalAppSubmittedDateGAspec: gaAppInfo.value.generalAppSubmittedDateGAspec,
    };
  });
}

function toCUIClaimGeneralApplications(ccdClaimGeneralApplications: CCDGeneralApplication[]): ClaimGeneralApplication[] {
  const claimGeneralApplications: ClaimGeneralApplication[] = [];
  ccdClaimGeneralApplications?.forEach(ccdGa => {
    const claimGa = new ClaimGeneralApplication();
    claimGa.id = ccdGa.id;
    claimGa.value = new ClaimGeneralApplicationValue();
    claimGa.value.caseLink = ccdGa.value?.caseLink;
    claimGa.value.parentClaimantIsApplicant = toCUIYesNo(ccdGa.value?.parentClaimantIsApplicant);
    claimGa.value.generalAppSubmittedDateGAspec = ccdGa.value?.generalAppSubmittedDateGAspec;
    claimGeneralApplications.push(claimGa);
  });
  return claimGeneralApplications;
}

export const displayToEnumKey = (displayValue: string): ApplicationTypeOption => {
  return (Object.keys(selectedApplicationTypeByOptions) as Array<keyof typeof selectedApplicationTypeByOptions>)
    .find(key => selectedApplicationTypeByOptions[key]?.[2] === displayValue) as ApplicationTypeOption | undefined;};
