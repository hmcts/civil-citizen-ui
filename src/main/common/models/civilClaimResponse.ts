import {StatementOfTruth} from './claim';
import {
  CaseState,
  CCDHelpWithFees,
  ClaimAmountBreakup,
  InterestClaimFromType,
  InterestEndDateType,
} from 'form/models/claimDetails';
import {ClaimantResponse} from 'models/claimantResponse';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {StatementOfMeans} from 'models/statementOfMeans';
import {PartialAdmission} from 'models/partialAdmission';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {Mediation} from 'models/mediation/mediation';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Interest} from 'form/models/interest/interest';
import {Document, ServedDocumentFiles} from 'models/document/document';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {ResponseDeadline} from 'models/responseDeadline';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {CCDParty} from 'models/ccdResponse/ccdParty';
import {ClaimUpdate} from 'models/events/eventDto';
import {CCDInterestType} from './ccdResponse/ccdInterestType';
import {CCDSameRateInterestSelection} from './ccdResponse/ccdSameRateInterestSelection';
import {CCDTimeLineOfEvents} from './ccdResponse/ccdTimeLineOfEvents';
import {CCDEvidence} from './ccdResponse/ccdEvidence';
import {CCDPaymentOption} from './ccdResponse/ccdPaymentOption';
import {CCDRepaymentPlan} from './ccdResponse/ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdResponse/ccdPayBySetDate';
import {FullAdmission} from './fullAdmission';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {RepaymentPlan} from './repaymentPlan';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {CCDRespondToClaim} from 'models/ccdResponse/ccdRespondToClaim';
import {CCDBankAccount} from 'models/ccdResponse/ccdBankAccount';
import {CCDHomeDetails} from 'models/ccdResponse/ccdHomeDetails';
import {CCDPartnerAndDependent} from 'models/ccdResponse/ccdPartnerAndDependent';
import {CCDEmployerDetails} from 'models/ccdResponse/ccdEmployerDetails';
import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {CCDUnemploymentDetails} from 'models/ccdResponse/ccdUnemploymentDetails';
import {CCDCourtOrders} from 'models/ccdResponse/ccdCourtOrders';
import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {CCDDebtDetails} from 'models/ccdResponse/ccdDebtDetails';
import {CCDRecurringIncome} from 'models/ccdResponse/ccdRecurringIncome';
import {CCDRecurringExpenses} from 'models/ccdResponse/ccdRecurringExpenses';
import {Evidence} from 'form/models/evidence/evidence';
import {CCDLanguage, CCDWelshLanguageRequirements} from 'models/ccdResponse/ccdWelshLanguageRequirements';
import {CCDVulnerability} from 'models/ccdResponse/ccdVulnerability';
import {CCDSpecificCourtLocations} from 'models/ccdResponse/ccdSpecificCourtLocations';
import {CCDWitnesses} from 'models/ccdResponse/ccdWitnesses';
import {CCDSmallClaimHearing} from 'models/ccdResponse/ccdSmallClaimHearing';
import {CCDFastClaimHearing} from 'models/ccdResponse/ccdFastClaimHearing';
import {CaseDocument} from 'models/document/caseDocument';
import {CCDExpert} from './ccdResponse/ccdExpert';
import {CaseProgressionHearingDocuments, HearingLocation} from 'models/caseProgression/caseProgressionHearing';
import {UploadEvidenceElementCCD} from 'models/caseProgression/uploadDocumentsType';
import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {CCDFinancialDetailsLiP} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {HearingDuration} from 'models/caseProgression/hearingDuration';
import {CCDBundle} from 'models/caseProgression/bundles/ccdBundle';
import {TrialArrangementsDocument} from 'models/caseProgression/trialArrangements/trialArrangements';
import {FinalOrderDocumentCollection} from 'models/caseProgression/finalOrderDocumentCollectionType';
import {CaseRole} from 'form/models/caseRoles';
import {CCDDJPaymentOption} from 'models/ccdResponse/ccdDJPaymentOption';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';
import {
  CCDTrialArrangementsHearingRequirements,
  CCDTrialArrangementsOtherComments,
} from 'models/ccdResponse/ccdTrialArrangementsHearingRequirements';
import {CCDAdditionalPartyDetails} from 'models/ccdResponse/ccdAdditionalPartyDetails';
import {CCDBreathingSpaceStartInfo} from 'models/ccd/ccdBreathingSpace/ccdBreathingSpaceStartInfo';
import {CCDClaimFee} from 'models/ccdResponse/ccdClaimFee';
import {CCDTimeLineOfEvent} from 'models/ccdResponse/ccdTimeLine';
import {HearingFee} from 'models/caseProgression/hearingFee/hearingFee';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';

export class CivilClaimResponse {
  id: string;
  case_data: CCDClaim;
  state: CaseState;
  last_modified: Date;

  constructor(
    id?: string,
    case_data?: CCDClaim,
    state?: CaseState,
    last_modified?: Date,
  ) {
    this.id = id;
    this.case_data = case_data;
    this.state = state;
    this.last_modified = last_modified;
  }
}

export interface CCDClaim extends ClaimUpdate {
  legacyCaseReference?: string;
  applicant1?: CCDParty;
  applicant1Represented?: YesNoUpperCamelCase,
  claimantResponse?: ClaimantResponse;
  applicantSolicitor1ClaimStatementOfTruth?: StatementOfTruth;
  totalClaimAmount?: number;
  respondent1ResponseDeadline?: Date;
  claimDetails?: ClaimDetails;
  respondent1?: CCDParty;
  statementOfMeans?: StatementOfMeans;
  fullAdmission?: FullAdmission;
  paymentOption?: PaymentOptionType;
  repaymentPlan?: RepaymentPlan;
  paymentDate?: Date;
  partialAdmission?: PartialAdmission;
  rejectAllOfClaim?: RejectAllOfClaim;
  mediation?: Mediation;
  evidence?: Evidence;
  taskSharedFinancialDetails?: boolean;
  defendantStatementOfTruth?: StatementOfTruthForm | QualifiedStatementOfTruth;
  claimAmountBreakup?: ClaimAmountBreakup[];
  totalInterest?: number;
  claimInterest?: YesNoUpperCamelCase;
  interest?: Interest; //TODO: Release 1: Some of the fields that have been refactored in Interest are used in Release 1, they must be included in the translator from CCD to work correctly (response/claim-details).
  submittedDate?: Date;
  issueDate?: Date;
  specClaimTemplateDocumentFiles?: Document;
  servedDocumentFiles?: ServedDocumentFiles;
  systemGeneratedCaseDocuments?: SystemGeneratedCaseDocuments[];
  respondentSolicitor1AgreedDeadlineExtension?: Date;
  ccdState?: CaseState;
  responseDeadline?: ResponseDeadline;
  directionQuestionnaire?: DirectionQuestionnaire;
  respondent1ResponseDate?: Date;
  specResponseTimelineOfEvents?: CCDTimeLineOfEvents[],
  detailsOfClaim?: string,
  speclistYourEvidenceList?: CCDEvidence[],
  specResponselistYourEvidenceList?: CCDEvidence[],
  interestClaimOptions?: CCDInterestType,
  breakDownInterestTotal?: number,
  breakDownInterestDescription?: string,
  sameRateInterestSelection?: CCDSameRateInterestSelection,
  interestClaimFrom?: InterestClaimFromType,
  interestFromSpecificDate?: string,
  interestFromSpecificDateDescription?: string,
  interestClaimUntil?: InterestEndDateType,
  respondent1ClaimResponseTypeForSpec?: string;
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCamelCase;
  claimantUserDetails?: IdamUserDetails;
  //Defendant Response part
  respondent1BankAccountList?: CCDBankAccount[];
  disabilityPremiumPayments?: YesNoUpperCamelCase;
  severeDisabilityPremiumPayments?: YesNoUpperCamelCase;
  respondent1DQHomeDetails?: CCDHomeDetails;
  respondent1PartnerAndDependent?: CCDPartnerAndDependent;
  defenceAdmitPartEmploymentTypeRequired?: YesNoUpperCamelCase;
  respondToClaimAdmitPartEmploymentTypeLRspec?: string[];
  responseClaimAdmitPartEmployer?: CCDEmployerDetails;
  specDefendant1SelfEmploymentDetails?: CCDSelfEmploymentDetails;
  respondToClaimAdmitPartUnemployedLRspec?: CCDUnemploymentDetails;
  respondent1CourtOrderPaymentOption?: YesNoUpperCamelCase;
  respondent1CourtOrderDetails?: CCDCourtOrders[];
  respondent1LoanCreditOption?: YesNoUpperCamelCase;
  respondent1LoanCreditDetails?: CCDLoanCredit[];
  responseToClaimAdmitPartWhyNotPayLRspec?: string;
  respondent1DQCarerAllowanceCredit?: YesNoUpperCamelCase;
  respondent1DQCarerAllowanceCreditFullAdmission?: YesNoUpperCamelCase;
  specDefendant1Debts?: CCDDebtDetails;
  respondent1DQRecurringIncome?: CCDRecurringIncome[];
  respondent1DQRecurringIncomeFA?: CCDRecurringIncome[];
  respondent1DQRecurringExpenses?: CCDRecurringExpenses[];
  respondent1DQRecurringExpensesFA?: CCDRecurringExpenses[];
  respondent1LiPResponse?: CCDRespondentLiPResponse;
  respondent1LiPFinancialDetails?: CCDFinancialDetailsLiP,
  respondent1DQLanguage?: CCDWelshLanguageRequirements;
  respondent1DQVulnerabilityQuestions?: CCDVulnerability;
  respondent1DQRequestedCourt?: CCDSpecificCourtLocations;
  respondent1DQWitnesses?: CCDWitnesses;
  respondent1DQHearingSmallClaim?: CCDSmallClaimHearing;
  respondent1DQHearingFastClaim?: CCDFastClaimHearing;
  sdoOrderDocument?: CaseDocument;
  respondToClaim?: CCDRespondToClaim;
  defenceRouteRequired?: string;
  respondent1DQExperts?: CCDExpert;
  responseClaimExpertSpecRequired?: YesNoUpperCamelCase;
  claimType?: string;
  specDefenceAdmittedRequired?: YesNoUpperCamelCase;
  respondToAdmittedClaim?: CCDRespondToClaim;
  detailsOfWhyDoesYouDisputeTheClaim?: string;
  respondToAdmittedClaimOwingAmount?: string;
  hearingDocuments?: CaseProgressionHearingDocuments[];
  hearingDate?: Date;
  hearingLocation?: HearingLocation;
  hearingTimeHourMinute?: string;
  hearingDuration?: HearingDuration;
  respondToAdmittedClaimOwingAmountPounds?: string;
  documentDisclosureList?: UploadEvidenceElementCCD[];
  documentForDisclosure?: UploadEvidenceElementCCD[];
  documentWitnessStatement?: UploadEvidenceElementCCD[];
  documentWitnessSummary?: UploadEvidenceElementCCD[];
  documentHearsayNotice?: UploadEvidenceElementCCD[];
  documentReferredInStatement?: UploadEvidenceElementCCD[];
  documentExpertReport?: UploadEvidenceElementCCD[];
  documentJointStatement?: UploadEvidenceElementCCD[];
  documentQuestions?: UploadEvidenceElementCCD[];
  documentAnswers?: UploadEvidenceElementCCD[];
  documentCaseSummary?: UploadEvidenceElementCCD[];
  documentSkeletonArgument?: UploadEvidenceElementCCD[];
  documentAuthorities?: UploadEvidenceElementCCD[];
  documentCosts?: UploadEvidenceElementCCD[];
  documentEvidenceForTrial?: UploadEvidenceElementCCD[];
  caseDocumentUploadDate?: Date;
  documentDisclosureListRes?: UploadEvidenceElementCCD[];
  documentForDisclosureRes?: UploadEvidenceElementCCD[];
  documentWitnessStatementRes?: UploadEvidenceElementCCD[];
  documentWitnessSummaryRes?: UploadEvidenceElementCCD[];
  documentHearsayNoticeRes?: UploadEvidenceElementCCD[];
  documentReferredInStatementRes?: UploadEvidenceElementCCD[];
  documentExpertReportRes?: UploadEvidenceElementCCD[];
  documentJointStatementRes?: UploadEvidenceElementCCD[];
  documentQuestionsRes?: UploadEvidenceElementCCD[];
  documentAnswersRes?: UploadEvidenceElementCCD[];
  documentCaseSummaryRes?: UploadEvidenceElementCCD[];
  documentSkeletonArgumentRes?: UploadEvidenceElementCCD[];
  documentAuthoritiesRes?: UploadEvidenceElementCCD[];
  documentCostsRes?: UploadEvidenceElementCCD[];
  documentEvidenceForTrialRes?: UploadEvidenceElementCCD[];
  caseDocumentUploadDateRes?: Date;
  takenOfflineDate?: Date;
  mediationAgreement?: MediationAgreement;
  unsuccessfulMediationReason?: string;
  ccjJudgmentStatement?:string;
  defaultJudgmentDocuments?: CaseDocument;
  lastModifiedDate?: Date;
  caseBundles?: CCDBundle[];
  trialReadyDocuments?: TrialArrangementsDocument[];
  applicant1AcceptPartAdmitPaymentPlanSpec?: YesNoUpperCamelCase;
  applicant1AcceptFullAdmitPaymentPlanSpec?: YesNoUpperCamelCase;
  finalOrderDocumentCollection?: FinalOrderDocumentCollection[];
  caseRole?: CaseRole;
  applicant1ProceedWithClaim?: YesNoUpperCamelCase;
  specRespondent1Represented?: YesNoUpperCamelCase;
  respondent1AdditionalLipPartyDetails?: CCDAdditionalPartyDetails;
  applicant1AdditionalLipPartyDetails?:CCDAdditionalPartyDetails;
  partialPayment?: YesNoUpperCamelCase;
  partialPaymentAmount?: string;
  paymentTypeSelection?: CCDDJPaymentOption;
  paymentSetDate?: Date;
  repaymentDue?: string;
  repaymentDate?: Date;
  repaymentFrequency?: CCDPaymentFrequency;
  repaymentSuggestion?: string;
  trialReadyApplicant?: YesNoUpperCamelCase;
  applicantRevisedHearingRequirements?: CCDTrialArrangementsHearingRequirements;
  applicantHearingOtherComments?: CCDTrialArrangementsOtherComments;
  trialReadyRespondent1?: YesNoUpperCamelCase;
  respondent1RevisedHearingRequirements?: CCDTrialArrangementsHearingRequirements;
  respondent1HearingOtherComments?: CCDTrialArrangementsOtherComments;
  enterBreathing?: CCDBreathingSpaceStartInfo;
  claimFee?:CCDClaimFee;
  timelineOfEvents?:CCDTimeLineOfEvent[];
  helpWithFees ?: CCDHelpWithFees;
  pcqId?: string;
  applicant1ResponseDate?: Date;
  liftBreathing?: CCDBreathingSpaceStartInfo;
  hearingFee?: HearingFee;
  hearingDueDate?: Date;
  applicant1RepaymentOptionForDefendantSpec?: CCDClaimantPaymentOption;
  claimantBilingualLanguagePreference?:CCDLanguage;
}

export interface ClaimFeeData {
  calculatedAmountInPence?: number;
  code?: string;
  version?: number;
}

export interface IdamUserDetails {
  email: string;
  id: string;
}
