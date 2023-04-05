import {StatementOfTruth} from './claim';
import {CaseState, ClaimAmountBreakup, ClaimFee, InterestClaimFromType, InterestEndDateType} from 'form/models/claimDetails';
import {ClaimantResponse} from 'models/claimantResponse';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {StatementOfMeans} from 'models/statementOfMeans';
import {PartialAdmission} from 'models/partialAdmission';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {Mediation} from 'models/mediation/mediation';
import {DefendantEvidence} from 'models/evidence/evidence';
import {TimeLineOfEvents} from 'models/timelineOfEvents/timeLineOfEvents';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Interest} from 'form/models/interest/interest';
import {Document} from 'models/document/document';
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
import {CCDExpert} from './ccdResponse/ccdExpert';

export class CivilClaimResponse {
  id: string;
  case_data: CCDClaim;
  state: CaseState;

  constructor(
    id?: string,
    case_data?: CCDClaim,
    state?: CaseState,
  ) {
    this.id = id;
    this.case_data = case_data;
    this.state = state;
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
  evidence?: DefendantEvidence;
  timelineOfEvents?: TimeLineOfEvents[]; // TODO: Release 2: ClaimDetails timeline needs to translate into this field
  taskSharedFinancialDetails?: boolean;
  defendantStatementOfTruth?: StatementOfTruthForm | QualifiedStatementOfTruth;
  claimAmountBreakup?: ClaimAmountBreakup[];
  totalInterest?: number;
  claimInterest?: YesNoUpperCamelCase;
  interest?: Interest; //TODO: Release 1: Some of the fields that have been refactored in Interest are used in Release 1, they must be included in the translator from CCD to work correctly (response/claim-details).
  submittedDate?: Date;
  issueDate?: Date;
  claimFee?: ClaimFee;
  specClaimTemplateDocumentFiles?: Document;
  systemGeneratedCaseDocuments?: SystemGeneratedCaseDocuments[];
  respondentSolicitor1AgreedDeadlineExtension?: Date;
  ccdState?: CaseState;
  responseDeadline?: ResponseDeadline;
  directionQuestionnaire?: DirectionQuestionnaire;
  respondent1ResponseDate?: Date;
  specResponseTimelineOfEvents?: CCDTimeLineOfEvents[],
  detailsOfClaim?: string,
  speclistYourEvidenceList?: CCDEvidence[],
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
  respondent1DQExperts?: CCDExpert;
  responseClaimExpertSpecRequired?: YesNoUpperCamelCase;

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
