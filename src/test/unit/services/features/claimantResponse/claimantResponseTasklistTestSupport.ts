import {Claim} from 'common/models/claim';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {CaseState} from 'common/form/models/claimDetails';
import {ResponseType} from 'common/form/models/responseType';
import {YesNo, YesNoNotReceived} from 'common/form/models/yesNo';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {CourtProposedDate, CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {CourtProposedPlan, CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {ChooseHowToProceed} from 'common/form/models/claimantResponse/chooseHowToProceed';
import {SignSettlmentAgreement} from 'common/form/models/claimantResponse/signSettlementAgreement';
import {CCJRequest} from 'common/models/claimantResponse/ccj/ccjRequest';
import {PaidAmount} from 'common/models/claimantResponse/ccj/paidAmount';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {PartialAdmission} from 'models/partialAdmission';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {Mediation} from 'common/models/mediation/mediation';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {Witnesses} from 'common/models/directionsQuestionnaire/witnesses/witnesses';
import {VulnerabilityQuestions} from 'common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {WelshLanguageRequirements} from 'common/models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {ExpertDetails} from 'common/models/directionsQuestionnaire/experts/expertDetails';
import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';

const expertWithDetails = new ExpertDetailsList([
  new ExpertDetails('Joe', 'Doe', 'test@test.com', 600000000, 'Test', 'Test', 100),
]);

export const CLAIM_ID = '5129';
export const LANG = 'en';

const NEXT = 'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT';
const RESPONSE = 'CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE';

export const TASK = {
  repayment: `${NEXT}.ACCEPT_OR_REJECT_REPAYMENT`,
  formalise: `${NEXT}.HOW_FORMALISE`,
  sign: `${NEXT}.SIGN_SETTLEMENT`,
  ccj: `${NEXT}.REQUEST_COUNTY_COURT_JUDGMENT`,
  alternative: `${NEXT}.PROPOSE_ALTERNATIVE_REPAYMENT`,
  admitted: `${NEXT}.ACCEPT_OR_REJECT_ADMITTED`,
  mediation: `${NEXT}.FREE_TELEPHONE_MEDIATION`,
  proceed: `${NEXT}.DECIDE_WHETHER_TO_PROCEED`,
  theirResponse: `${NEXT}.ACCEPT_OR_REJECT_THEIR_RESPONSE`,
  paid: `${RESPONSE}.HAVE_BEEN_PAID`,
  settle: `${RESPONSE}.SETTLE_CLAIM_FOR`,
  view: 'CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.VIEW_DEFENDANTS_RESPONSE',
  hearing: 'TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS',
  telephone: 'COMMON.TELEPHONE_MEDIATION',
  availability: 'COMMON.AVAILABILITY_FOR_MEDIATION',
  submit: 'TASK_LIST.SUBMIT.CHECK_AND_SUBMIT',
  yourResponseTitle: `${RESPONSE}.TITLE`,
};

export type TaskExpectation = [string, TaskStatus];

export const complete = (description: string): TaskExpectation => [description, TaskStatus.COMPLETE];
export const incomplete = (description: string): TaskExpectation => [description, TaskStatus.INCOMPLETE];

export interface ClaimantResponseSpec {
  viewed?: boolean;
  paidYou?: YesNo;
  settled?: YesNo;
  partPayment?: YesNo;
  partAdmitted?: YesNo;
  acceptPlan?: YesNo;
  intention?: YesNo;
  proceed?: ChooseHowProceed;
  signed?: 'present' | YesNo.YES;
  ccjPaid?: YesNo;
  ccjAmount?: number;
  courtDate?: CourtProposedDateOptions;
  courtPlan?: CourtProposedPlanOptions;
  courtDecision?: RepaymentDecisionType;
  suggested?: PaymentOptionType;
  rejection?: string;
}

export interface ClaimSpec {
  type?: ResponseType;
  amount?: number;
  paid?: number;
  alreadyPaid?: YesNo;
  payment?: PaymentOptionType;
  paymentDate?: boolean;
  instalments?: boolean;
  clearPayment?: boolean;
  mediation?: 'phone' | 'option';
  mockMediation?: boolean;
  mockLrMediation?: boolean;
  // First call only. Later calls use the real part-admission claim, which is what the old shared setup asserted.
  spyFullDefenceOnce?: boolean;
  spyPaidInFullOnce?: boolean;
  response?: ClaimantResponseSpec;
}

const yesNo = (option?: YesNo): GenericYesNo | undefined => option ? new GenericYesNo(option) : undefined;

const applyResponse = (spec?: ClaimantResponseSpec): ClaimantResponse | undefined => {
  if (!spec) {
    return undefined;
  }
  const response = new ClaimantResponse();
  response.defendantResponseViewed = spec.viewed;
  response.hasDefendantPaidYou = yesNo(spec.paidYou);
  response.hasFullDefenceStatesPaidClaimSettled = yesNo(spec.settled);
  response.hasPartPaymentBeenAccepted = yesNo(spec.partPayment);
  response.hasPartAdmittedBeenAccepted = yesNo(spec.partAdmitted);
  response.fullAdmitSetDateAcceptPayment = yesNo(spec.acceptPlan);
  response.intentionToProceed = yesNo(spec.intention);
  if (spec.proceed) {
    response.chooseHowToProceed = new ChooseHowToProceed(spec.proceed);
  }
  if (spec.signed === 'present') {
    response.signSettlementAgreement = new SignSettlmentAgreement();
  }
  if (spec.signed === YesNo.YES) {
    response.signSettlementAgreement = new SignSettlmentAgreement(YesNo.YES);
  }
  if (spec.ccjPaid) {
    response.ccjRequest = new CCJRequest();
    response.ccjRequest.paidAmount = new PaidAmount(spec.ccjPaid, spec.ccjAmount);
  }
  if (spec.courtDate) {
    response.courtProposedDate = new CourtProposedDate();
    response.courtProposedDate.decision = spec.courtDate;
  }
  if (spec.courtPlan) {
    response.courtProposedPlan = new CourtProposedPlan();
    response.courtProposedPlan.decision = spec.courtPlan;
  }
  response.courtDecision = spec.courtDecision;
  if (spec.suggested) {
    response.suggestedPaymentIntention = new PaymentIntention();
    response.suggestedPaymentIntention.paymentOption = spec.suggested;
  }
  if (spec.rejection) {
    response.rejectionReason = {text: spec.rejection};
  }
  return response;
};

export const buildClaimantResponseClaim = (spec: ClaimSpec = {}): Claim => {
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  if (spec.type) {
    claim.respondent1 = {responseType: spec.type};
  }
  claim.totalClaimAmount = spec.amount;
  if (spec.paid !== undefined) {
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    claim.rejectAllOfClaim.option = RejectAllOfClaimType.ALREADY_PAID;
    claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
    claim.rejectAllOfClaim.howMuchHaveYouPaid.amount = spec.paid;
  }
  if (spec.clearPayment || spec.payment || spec.paymentDate || spec.instalments || spec.alreadyPaid) {
    const partialAdmission = new PartialAdmission();
    if (!spec.clearPayment && (spec.payment || spec.paymentDate || spec.instalments)) {
      partialAdmission.paymentIntention = new PaymentIntention();
      partialAdmission.paymentIntention.paymentOption = spec.payment;
      partialAdmission.paymentIntention.paymentDate = spec.paymentDate ? new Date() : undefined;
      partialAdmission.paymentIntention.repaymentPlan = spec.instalments ? {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.WEEK,
        firstRepaymentDate: new Date(),
      } : undefined;
    }
    partialAdmission.alreadyPaid = yesNo(spec.alreadyPaid);
    claim.partialAdmission = partialAdmission;
  }
  if (spec.mediation === 'phone') {
    claim.mediation = new Mediation();
    claim.mediation.companyTelephoneNumber = new CompanyTelephoneNumber();
    claim.mediation.companyTelephoneNumber.mediationPhoneNumber = '1';
    claim.mediation.canWeUse = {mediationPhoneNumber: '12'};
  }
  if (spec.mediation === 'option') {
    claim.mediation = {
      canWeUse: {option: YesNo.YES},
      companyTelephoneNumber: {},
    } as Mediation;
  }
  claim.claimantResponse = applyResponse(spec.response);
  if (spec.mockMediation !== undefined) {
    claim.isDefendantAgreedForMediation = jest.fn().mockReturnValue(spec.mockMediation);
  }
  if (spec.mockLrMediation !== undefined) {
    claim.isDefendantLrAgreedForMediation = jest.fn().mockReturnValue(spec.mockLrMediation);
  }
  if (spec.spyFullDefenceOnce) {
    jest.spyOn(claim, 'isFullDefence').mockReturnValueOnce(true);
  }
  if (spec.spyPaidInFullOnce) {
    jest.spyOn(claim, 'hasPaidInFull').mockReturnValueOnce(true);
  }
  return claim;
};

export type HearingAdjustment =
  | 'empty-dq'
  | 'empty-witnesses'
  | 'empty-hearing'
  | 'empty-vulnerability'
  | 'empty-welsh'
  | 'small-expert-not-required'
  | 'small-expert-report-yes'
  | 'small-expert-report-no'
  | 'small-permission-no'
  | 'small-permission-yes'
  | 'small-examine-no'
  | 'small-examine-yes'
  | 'small-expert-details'
  | 'small-expert-details-missing'
  | 'fast-no-expert-evidence'
  | 'fast-reports-missing'
  | 'fast-shared-missing'
  | 'fast-details-empty'
  | 'fast-expert-complete'
  | 'intermediate-documents-missing'
  | 'intermediate-complete';

export interface HearingSpec {
  name: string;
  amount?: number;
  minti?: boolean;
  partAdmitted?: YesNo | 'replaced' | 'cleared';
  paidYou?: YesNo;
  partPayment?: YesNo;
  adjustment?: HearingAdjustment;
  expected: TaskStatus | 'absent';
  track?: 'small' | 'fast';
}

const commonJourney = (): DirectionQuestionnaire => Object.assign(new DirectionQuestionnaire(), {
  defendantYourselfEvidence: {option: YesNo.NO},
  hearing: {
    phoneOrVideoHearing: {option: YesNo.NO},
    supportRequiredList: {option: YesNo.NO},
    specificCourtLocation: {} as SpecificCourtLocation,
    cantAttendHearingInNext12Months: {option: YesNo.NO},
  } as Hearing,
  witnesses: {otherWitnesses: {option: YesNo.NO}} as Witnesses,
  vulnerabilityQuestions: {vulnerability: {option: YesNo.NO}} as VulnerabilityQuestions,
  welshLanguageRequirements: {
    language: {
      speakLanguage: LanguageOptions.WELSH,
      documentsLanguage: LanguageOptions.ENGLISH,
    },
  } as WelshLanguageRequirements,
  experts: new Experts(),
});

const withBaseDirectionQuestionnaire = (claim: Claim): DirectionQuestionnaire => {
  claim.claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const questionnaire = new DirectionQuestionnaire();
  questionnaire.hearing = new Hearing();
  questionnaire.experts = new Experts();
  questionnaire.witnesses = new Witnesses();
  questionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
  questionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
  claim.claimantResponse.directionQuestionnaire = questionnaire;
  return questionnaire;
};

const useCommonJourney = (questionnaire: DirectionQuestionnaire): DirectionQuestionnaire => {
  const completed = commonJourney();
  Object.assign(questionnaire, completed);
  return questionnaire;
};

const applyHearingAdjustment = (claim: Claim, adjustment: HearingAdjustment): void => {
  const questionnaire = () => claim.claimantResponse.directionQuestionnaire;
  const completeSmallHearing = () => {
    useCommonJourney(questionnaire());
    questionnaire().hearing.determinationWithoutHearing = {option: YesNo.YES};
  };
  const fastTrackHearing = () => {
    questionnaire().hearing.triedToSettle = {option: YesNo.YES};
    questionnaire().hearing.requestExtra4weeks = {option: YesNo.YES};
  };
  switch (adjustment) {
    case 'empty-dq':
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      break;
    case 'empty-witnesses':
      questionnaire().witnesses = new Witnesses();
      break;
    case 'empty-hearing':
      questionnaire().hearing = new Hearing();
      break;
    case 'empty-vulnerability':
      questionnaire().vulnerabilityQuestions = new VulnerabilityQuestions();
      break;
    case 'empty-welsh':
      questionnaire().welshLanguageRequirements = new WelshLanguageRequirements();
      break;
    case 'small-expert-not-required':
      completeSmallHearing();
      questionnaire().experts.expertRequired = false;
      break;
    case 'small-expert-report-yes':
      completeSmallHearing();
      questionnaire().experts.expertRequired = true;
      questionnaire().experts.expertReportDetails = {option: YesNo.YES};
      break;
    case 'small-expert-report-no':
      questionnaire().experts.expertRequired = true;
      questionnaire().experts.expertReportDetails = {option: YesNo.NO};
      break;
    case 'small-permission-no':
      completeSmallHearing();
      questionnaire().experts.permissionForExpert = {option: YesNo.NO};
      break;
    case 'small-permission-yes':
      questionnaire().experts.permissionForExpert = {option: YesNo.YES};
      break;
    case 'small-examine-no':
      completeSmallHearing();
      questionnaire().experts.expertCanStillExamine = {option: YesNo.NO};
      break;
    case 'small-examine-yes':
      questionnaire().experts.expertCanStillExamine = {option: YesNo.YES};
      break;
    case 'small-expert-details':
      completeSmallHearing();
      questionnaire().experts.expertDetailsList = expertWithDetails;
      break;
    case 'small-expert-details-missing':
      questionnaire().experts.expertDetailsList = undefined;
      break;
    case 'fast-no-expert-evidence':
      useCommonJourney(questionnaire());
      questionnaire().experts = {expertEvidence: {option: YesNo.NO}};
      fastTrackHearing();
      questionnaire().hearing.considerClaimantDocuments = {option: YesNo.YES};
      break;
    case 'fast-reports-missing':
      questionnaire().experts.expertEvidence = {option: YesNo.YES};
      questionnaire().experts.sentExpertReports = {};
      break;
    case 'fast-shared-missing':
      questionnaire().experts.sharedExpert = {};
      break;
    case 'fast-details-empty':
      questionnaire().experts.expertDetailsList = {items: []};
      break;
    case 'fast-expert-complete':
      useCommonJourney(questionnaire());
      fastTrackHearing();
      questionnaire().hearing.considerClaimantDocuments = {option: YesNo.YES};
      questionnaire().experts.sentExpertReports = {option: YesNoNotReceived.YES};
      questionnaire().experts.sharedExpert = {option: YesNo.YES};
      questionnaire().experts.expertDetailsList = expertWithDetails;
      break;
    case 'intermediate-documents-missing':
      useCommonJourney(questionnaire());
      questionnaire().experts = {expertEvidence: {option: YesNo.NO}};
      fastTrackHearing();
      break;
    case 'intermediate-complete':
      useCommonJourney(questionnaire());
      questionnaire().experts = {expertEvidence: {option: YesNo.NO}};
      fastTrackHearing();
      questionnaire().hearing.hasDocumentsToBeConsidered = {option: YesNo.YES};
      break;
    default:
      break;
  }
};

export const buildHearingClaim = (spec: HearingSpec): Claim => {
  const partAdmitted = spec.partAdmitted === 'replaced' || spec.partAdmitted === 'cleared'
    ? undefined
    : spec.partAdmitted ?? YesNo.NO;
  const claim = buildClaimantResponseClaim({
    amount: spec.amount,
    response: spec.partAdmitted === 'replaced' ? undefined : {
      partAdmitted,
      paidYou: spec.paidYou,
      partPayment: spec.partPayment,
    },
  });
  if (spec.partAdmitted === 'replaced') {
    claim.claimantResponse = {hasPartAdmittedBeenAccepted: undefined} as ClaimantResponse;
    return claim;
  }
  withBaseDirectionQuestionnaire(claim);
  if (spec.partAdmitted === 'cleared') {
    claim.claimantResponse.hasPartAdmittedBeenAccepted = undefined;
  }
  if (spec.adjustment) {
    applyHearingAdjustment(claim, spec.adjustment);
  }
  return claim;
};
