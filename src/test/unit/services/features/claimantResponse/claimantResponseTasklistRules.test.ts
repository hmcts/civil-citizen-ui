import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {ResponseType} from 'form/models/responseType';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {CaseState} from 'form/models/claimDetails';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {
  buildClaimantHearingRequirementsSection,
  buildWhatToDoNextSection,
  buildYourResponseSection,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistBuilder';
import {Task} from 'models/taskList/task';

jest.mock('i18next', () => ({t: (key: string, options: {lng: string}) => `${options.lng}:${key}`}));

const taskNames = (tasks: Task[]) => tasks.map(task => task.description.split('.').pop());
const yes = () => new GenericYesNo(YesNo.YES);
const no = () => new GenericYesNo(YesNo.NO);

interface Scenario {
  name: string;
  type: ResponseType;
  response?: Partial<ClaimantResponse>;
  payment?: PaymentOptionType;
  mediation?: boolean;
  paid?: number;
  expected: string[];
}

const claimFor = (scenario: Scenario): Claim => {
  const claim = new Claim();
  claim.respondent1 = {responseType: scenario.type};
  claim.totalClaimAmount = 9000;
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  claim.claimantResponse = Object.assign(new ClaimantResponse(), scenario.response);
  claim.partialAdmission = {paymentIntention: {paymentOption: scenario.payment}};
  if (scenario.mediation) {
    claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
    claim.responseClaimMediationSpecRequired = YesNo.YES;
  }
  if (scenario.paid !== undefined) {
    claim.rejectAllOfClaim = {
      option: RejectAllOfClaimType.ALREADY_PAID,
      howMuchHaveYouPaid: {amount: scenario.paid},
    } as RejectAllOfClaim;
  }
  return claim;
};

const repayment = 'ACCEPT_OR_REJECT_REPAYMENT';
const admitted = 'ACCEPT_OR_REJECT_ADMITTED';
const formalise = 'HOW_FORMALISE';
const alternative = 'PROPOSE_ALTERNATIVE_REPAYMENT';
const judgment = 'REQUEST_COUNTY_COURT_JUDGMENT';
const mediation = 'FREE_TELEPHONE_MEDIATION';

const scenarios: Scenario[] = [
  {name: 'unanswered full admission', type: ResponseType.FULL_ADMISSION, expected: [repayment]},
  {name: 'accepted repayment without a formalisation choice', type: ResponseType.FULL_ADMISSION,
    response: {fullAdmitSetDateAcceptPayment: yes()}, expected: [repayment, formalise]},
  {name: 'accepted repayment followed by settlement', type: ResponseType.FULL_ADMISSION,
    response: {fullAdmitSetDateAcceptPayment: yes(), chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}},
    expected: [repayment, formalise, 'SIGN_SETTLEMENT']},
  {name: 'accepted repayment followed by judgment', type: ResponseType.FULL_ADMISSION,
    response: {fullAdmitSetDateAcceptPayment: yes(), chooseHowToProceed: {option: ChooseHowProceed.REQUEST_A_CCJ}},
    expected: [repayment, formalise, judgment]},
  {name: 'rejected repayment without a court decision', type: ResponseType.FULL_ADMISSION,
    response: {fullAdmitSetDateAcceptPayment: no()}, expected: [repayment, alternative]},
  {name: 'rejected repayment with a favourable court decision and settlement', type: ResponseType.FULL_ADMISSION,
    response: {fullAdmitSetDateAcceptPayment: no(), courtDecision: RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT,
      chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}},
    expected: [repayment, alternative, formalise, 'SIGN_SETTLEMENT']},
  {name: 'rejected repayment with an accepted court date', type: ResponseType.FULL_ADMISSION,
    response: {fullAdmitSetDateAcceptPayment: no(), courtProposedDate: {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE}},
    expected: [repayment, alternative, formalise]},
  {name: 'rejected repayment requiring a judge', type: ResponseType.FULL_ADMISSION,
    response: {fullAdmitSetDateAcceptPayment: no(), courtProposedDate: {decision: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE}},
    expected: [repayment, alternative, judgment]},
  {name: 'court decision takes precedence over an earlier judge request', type: ResponseType.FULL_ADMISSION,
    response: {fullAdmitSetDateAcceptPayment: no(), courtDecision: RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT,
      courtProposedDate: {decision: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE}},
    expected: [repayment, alternative, formalise]},
  {name: 'unanswered partial admission', type: ResponseType.PART_ADMISSION, expected: [admitted]},
  {name: 'accepted partial admission paid immediately', type: ResponseType.PART_ADMISSION,
    payment: PaymentOptionType.IMMEDIATELY, response: {hasPartAdmittedBeenAccepted: yes()}, expected: [admitted]},
  {name: 'accepted partial admission with an accepted repayment plan', type: ResponseType.PART_ADMISSION,
    payment: PaymentOptionType.BY_SET_DATE, response: {hasPartAdmittedBeenAccepted: yes(), fullAdmitSetDateAcceptPayment: yes()},
    expected: [admitted, repayment, formalise]},
  {name: 'accepted partial admission with a rejected repayment plan requiring a judge', type: ResponseType.PART_ADMISSION,
    payment: PaymentOptionType.INSTALMENTS, response: {hasPartAdmittedBeenAccepted: yes(), fullAdmitSetDateAcceptPayment: no(),
      courtProposedDate: {decision: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE}}, expected: [admitted, repayment, alternative, judgment]},
  {name: 'full defence with both mediation triggers', type: ResponseType.FULL_DEFENCE, mediation: true,
    response: {intentionToProceed: yes(), hasFullDefenceStatesPaidClaimSettled: no()},
    expected: ['DECIDE_WHETHER_TO_PROCEED', mediation, mediation]},
  {name: 'full defence without a mediation agreement', type: ResponseType.FULL_DEFENCE,
    response: {intentionToProceed: yes(), hasFullDefenceStatesPaidClaimSettled: no()}, expected: ['DECIDE_WHETHER_TO_PROCEED']},
  {name: 'full defence paid in full and rejected by the claimant', type: ResponseType.FULL_DEFENCE, paid: 9000,
    response: {hasPartPaymentBeenAccepted: no()}, expected: ['ACCEPT_OR_REJECT_THEIR_RESPONSE', mediation]},
  {name: 'full defence paid less suppresses all next steps even with mediation triggers', type: ResponseType.FULL_DEFENCE,
    paid: 500, mediation: true, response: {intentionToProceed: yes(), hasPartPaymentBeenAccepted: no(), hasFullDefenceStatesPaidClaimSettled: no()},
    expected: []},
];

describe.each(['en', 'cy'])('claimant task rule combinations (%s)', lang => {
  it.each(scenarios)('preserves task order for $name', scenario => {
    const claim = claimFor(scenario);
    const before = JSON.stringify(claim);
    const section = buildWhatToDoNextSection(claim, '1234', lang);
    expect(taskNames(section.tasks)).toEqual(scenario.expected);
    expect(section.title).toBe(`${lang}:CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.TITLE`);
    expect(section.tasks.every(task => task.description.startsWith(`${lang}:`))).toBe(true);
    expect(JSON.stringify(claim)).toBe(before);
  });

  it.each([false, true])('retains both hearing tasks when both rules match (minti=%s)', minti => {
    const claim = claimFor({name: 'overlapping hearing conditions', type: ResponseType.FULL_DEFENCE,
      response: {intentionToProceed: yes(), hasFullDefenceStatesPaidClaimSettled: no()}, expected: []});
    const section = buildClaimantHearingRequirementsSection(claim, '1234', lang, minti);
    expect(taskNames(section.tasks)).toEqual(['GIVE_US_DETAILS', 'GIVE_US_DETAILS']);
    expect(section.tasks[0]).toEqual(section.tasks[1]);
  });

  it.each([false, true])('preserves payment and mediation task order (carm=%s)', carm => {
    const claim = claimFor({name: 'paid partial admission', type: ResponseType.PART_ADMISSION,
      response: {hasDefendantPaidYou: yes(), hasPartPaymentBeenAccepted: no()}, mediation: true, expected: []});
    claim.partialAdmission.alreadyPaid = yes();
    const section = buildYourResponseSection(claim, '1234', lang, carm);
    expect(taskNames(section.tasks)).toEqual(carm
      ? ['HAVE_BEEN_PAID', 'SETTLE_CLAIM_FOR']
      : ['HAVE_BEEN_PAID', 'SETTLE_CLAIM_FOR', mediation]);
  });
});
