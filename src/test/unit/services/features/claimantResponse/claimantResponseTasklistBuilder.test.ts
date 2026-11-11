import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {YesNo} from 'common/form/models/yesNo';
import {ResponseType} from 'common/form/models/responseType';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
  CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL,
  CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  DETERMINATION_WITHOUT_HEARING_URL,
  DQ_TRIED_TO_SETTLE_CLAIM_URL,
} from 'routes/urls';
import {
  buildClaimantHearingRequirementsSection,
  buildClaimantResponseMediationSection,
  buildClaimantResponseSubmitSection,
  buildHowDefendantRespondSection,
  buildWhatToDoNextSection,
  buildYourResponseSection,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistBuilder';
import {Task} from 'models/taskList/task';
import {
  buildClaimantResponseClaim,
  buildHearingClaim,
  CLAIM_ID,
  ClaimantResponseSpec,
  ClaimSpec,
  complete,
  HearingAdjustment,
  HearingSpec,
  incomplete,
  LANG,
  TASK,
  TaskExpectation,
} from './claimantResponseTasklistTestSupport';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const url = (path: string) => constructResponseUrlWithIdParams(CLAIM_ID, path);
const urls = {
  view: url(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL),
  paid: url(CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL),
  settle: url(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL),
  mediation: url(CITIZEN_FREE_TELEPHONE_MEDIATION_URL),
  small: url(DETERMINATION_WITHOUT_HEARING_URL),
  fast: url(DQ_TRIED_TO_SETTLE_CLAIM_URL),
  submit: url(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL),
};

const expectTasks = (tasks: Task[], expected: TaskExpectation[], taskUrls: Record<string, string> = {}) => {
  expect(tasks.map(task => [task.description, task.status])).toEqual(expected);
  tasks.forEach(task => {
    if (taskUrls[task.description]) {
      expect(task.url).toEqual(taskUrls[task.description]);
    }
  });
};

const expectNext = (spec: ClaimSpec, expected: TaskExpectation[], hearing?: TaskExpectation[]) => {
  const claim = buildClaimantResponseClaim(spec);
  expectTasks(buildWhatToDoNextSection(claim, CLAIM_ID, LANG).tasks, expected);
  if (hearing) {
    expectTasks(buildClaimantHearingRequirementsSection(claim, CLAIM_ID, LANG, false).tasks, hearing);
  }
};

interface NextCase {
  name: string;
  spec: ClaimSpec;
  expected: TaskExpectation[];
  hearing?: TaskExpectation[];
}

const admitted = (response: ClaimantResponseSpec, extra: ClaimSpec = {}): ClaimSpec => ({
  type: ResponseType.PART_ADMISSION,
  mockMediation: true,
  response: {partAdmitted: YesNo.YES, ...response},
  ...extra,
});

const fullDefencePaid = (paid: number, response?: ClaimantResponseSpec, mediation?: ClaimSpec['mediation']): ClaimSpec => ({
  type: ResponseType.FULL_DEFENCE,
  amount: 9000,
  paid,
  mediation,
  response,
});

describe('Full Defence', () => {
  const cases: NextCase[] = [
    {
      name: 'should display decide whether to proceed task with proceed value as no as complete with hearing requirements as incomplete and free telephone mediation as incomplete for full defense states paid minti not applicable',
      spec: fullDefencePaid(9000, {
        paidYou: YesNo.NO,
        settled: YesNo.NO,
        partPayment: YesNo.YES,
        partAdmitted: YesNo.NO,
      }, 'phone'),
      expected: [complete(TASK.theirResponse), incomplete(TASK.mediation)],
      hearing: [incomplete(TASK.hearing)],
    },
    {
      name: 'should display decide wether to proceed task with proceed value as no as complete and mediation part is built for full defense states paid',
      spec: fullDefencePaid(9000, {
        paidYou: YesNo.YES,
        settled: YesNo.NO,
        partPayment: YesNo.YES,
        partAdmitted: YesNo.NO,
      }, 'phone'),
      expected: [complete(TASK.theirResponse), incomplete(TASK.mediation)],
    },
    {
      name: 'should display decide wether to proceed task with proceed value as yes as complete for full defense states paid',
      spec: fullDefencePaid(9000, {settled: YesNo.YES, partPayment: YesNo.YES}),
      expected: [complete(TASK.theirResponse)],
    },
  ];

  it.each(cases)('$name', ({spec, expected, hearing}) => {
    expectNext(spec, expected, hearing);
  });
});

describe('Claimant Response Task List builder', () => {
  describe('How they responded section', () => {
    it.each([
      {name: 'should display view defendant`s response task as incomplete', viewed: false, status: TaskStatus.INCOMPLETE},
      {name: 'should display view defendant`s response task as complete', viewed: true, status: TaskStatus.COMPLETE},
    ])('$name', ({viewed, status}) => {
      const claim = buildClaimantResponseClaim({response: viewed ? {viewed: true} : {}});
      expectTasks(buildHowDefendantRespondSection(claim, CLAIM_ID, LANG).tasks, [[TASK.view, status]], { [TASK.view]: urls.view });
    });
  });

  describe('Choose what to do next section', () => {
    const repayment = (acceptPlan?: YesNo, extra: ClaimantResponseSpec = {}): ClaimantResponseSpec => ({
      acceptPlan,
      ...extra,
    });

    const fullAdmission: NextCase[] = [
      {
        name: 'should display Accept or reject Repayment Plan task as incomplete',
        spec: {type: ResponseType.FULL_ADMISSION},
        expected: [incomplete(TASK.repayment)],
      },
      {
        name: 'should display Choose how to formalise task as incomplete',
        spec: {type: ResponseType.FULL_ADMISSION, response: repayment(YesNo.YES)},
        expected: [complete(TASK.repayment), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Sign Settlement as complete',
        spec: {type: ResponseType.FULL_ADMISSION, response: repayment(YesNo.YES, {proceed: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT, signed: 'present'})},
        expected: [complete(TASK.repayment), complete(TASK.formalise), complete(TASK.sign)],
      },
      {
        name: 'should display Request a CCJ as complete',
        spec: {type: ResponseType.FULL_ADMISSION, response: repayment(YesNo.YES, {proceed: ChooseHowProceed.REQUEST_A_CCJ, ccjPaid: YesNo.YES, ccjAmount: 10})},
        expected: [complete(TASK.repayment), complete(TASK.formalise), complete(TASK.ccj)],
      },
      {
        name: 'should display Propose Alternative Repayment Plan as incomplete',
        spec: {type: ResponseType.FULL_ADMISSION, response: repayment(YesNo.NO)},
        expected: [complete(TASK.repayment), incomplete(TASK.alternative)],
      },
      {
        name: 'should display Choose how to formalise repayment task as incomplete when the court date is accepted',
        spec: {type: ResponseType.FULL_ADMISSION, response: repayment(YesNo.NO, {suggested: PaymentOptionType.IMMEDIATELY, courtDate: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE})},
        expected: [complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Request a County Court Judgment task as incomplete when a judge date is requested',
        spec: {type: ResponseType.FULL_ADMISSION, response: repayment(YesNo.NO, {suggested: PaymentOptionType.IMMEDIATELY, courtDate: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE})},
        expected: [complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.ccj)],
      },
      {
        name: 'should display Choose how to formalise repayment task as incomplete when the court plan is accepted',
        spec: {type: ResponseType.FULL_ADMISSION, response: repayment(YesNo.NO, {suggested: PaymentOptionType.IMMEDIATELY, courtPlan: CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN})},
        expected: [complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Request a County Court Judgment task as incomplete when a judge plan is requested',
        spec: {type: ResponseType.FULL_ADMISSION, response: repayment(YesNo.NO, {suggested: PaymentOptionType.IMMEDIATELY, courtPlan: CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN})},
        expected: [complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.ccj)],
      },
      {
        name: 'should display Choose how to formalise repayment task as incomplete when the court decides for the claimant',
        spec: {type: ResponseType.FULL_ADMISSION, response: repayment(YesNo.NO, {suggested: PaymentOptionType.IMMEDIATELY, courtDecision: RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT})},
        expected: [complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.formalise)],
      },
    ];

    const byDate = {payment: PaymentOptionType.BY_SET_DATE, paymentDate: true};
    const instalments = {payment: PaymentOptionType.INSTALMENTS};
    const instalmentsWithPlan = {payment: PaymentOptionType.INSTALMENTS, instalments: true};

    const partAdmission: NextCase[] = [
      {
        name: 'should display Accept or reject the amount task as incomplete',
        spec: {type: ResponseType.PART_ADMISSION, mockMediation: true},
        expected: [incomplete(TASK.admitted)],
      },
      {
        name: 'should display Free telephone mediation task as incomplete',
        spec: {type: ResponseType.PART_ADMISSION, mockMediation: true, response: {partAdmitted: YesNo.NO}},
        expected: [complete(TASK.admitted), incomplete(TASK.mediation)],
      },
      {
        name: 'should display Accept or reject their repayment plan task as incomplete',
        spec: admitted({}, byDate),
        expected: [complete(TASK.admitted), incomplete(TASK.repayment)],
      },
      {
        name: 'should display Choose how to formalise repayment task as complete when the repayment plan is accepted',
        spec: admitted({acceptPlan: YesNo.YES}, {payment: PaymentOptionType.BY_SET_DATE}),
        expected: [complete(TASK.admitted), complete(TASK.repayment), incomplete(TASK.formalise)],
      },
      {
        name: 'should display propose alternative repayment task as incomplete',
        spec: admitted({acceptPlan: YesNo.NO}, {payment: PaymentOptionType.BY_SET_DATE}),
        expected: [complete(TASK.admitted), complete(TASK.repayment), incomplete(TASK.alternative)],
      },
      {
        name: 'should display Choose how to formalise repayment task as incomplete when a part admission court date is accepted',
        spec: admitted({acceptPlan: YesNo.NO, suggested: PaymentOptionType.IMMEDIATELY, courtDate: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE}, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Request a County Court Judgment task as incomplete when a part admission judge date is requested',
        spec: admitted({acceptPlan: YesNo.NO, suggested: PaymentOptionType.BY_SET_DATE, courtDate: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE}, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.ccj)],
      },
      {
        name: 'should display Choose how to formalise repayment task as incomplete when a part admission court plan is accepted',
        spec: admitted({acceptPlan: YesNo.NO, suggested: PaymentOptionType.BY_SET_DATE, courtPlan: CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN}, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Request a County Court Judgment task as incomplete when a part admission judge plan is requested',
        spec: admitted({acceptPlan: YesNo.NO, suggested: PaymentOptionType.BY_SET_DATE, courtPlan: CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN}, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.ccj)],
      },
      {
        name: 'should display Choose how to formalise repayment task as incomplete when the court decides a part admission for the claimant',
        spec: admitted({acceptPlan: YesNo.NO, suggested: PaymentOptionType.BY_SET_DATE, courtDecision: RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT}, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.alternative), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Choose how to formalise repayment task as incomplete when payment is by a set date',
        spec: admitted({acceptPlan: YesNo.YES}, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Choose how to formalise repayment task as complete when settlement is chosen',
        spec: admitted({acceptPlan: YesNo.YES, proceed: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.formalise), incomplete(TASK.sign)],
      },
      {
        name: 'should display Accept or Reject Admitted task as complete when no payment intention is recorded',
        spec: admitted({acceptPlan: YesNo.YES}, {clearPayment: true}),
        expected: [complete(TASK.admitted), complete(TASK.repayment), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Choose how to formalise repayment task as incomplete for instalments',
        spec: admitted({acceptPlan: YesNo.YES}, instalmentsWithPlan),
        expected: [complete(TASK.admitted), complete(TASK.repayment), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Accept or Reject Repayment task as complete when an instalment plan has a court date',
        spec: admitted({
          acceptPlan: YesNo.YES,
          proceed: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT,
          courtDate: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE,
        }, instalments),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.formalise), incomplete(TASK.sign)],
      },
      {
        name: 'should display Accept or Reject Repayment task as complete for payment by a set date',
        spec: admitted({acceptPlan: YesNo.YES}, {payment: PaymentOptionType.BY_SET_DATE}),
        expected: [complete(TASK.admitted), complete(TASK.repayment), incomplete(TASK.formalise)],
      },
      {
        name: 'should display Choose how to formalise repayment task as complete for an instalment plan',
        spec: admitted({
          acceptPlan: YesNo.YES,
          proceed: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT,
          courtDate: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE,
        }, instalmentsWithPlan),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.formalise), incomplete(TASK.sign)],
      },
      {
        name: 'should display Sign a settlement agreement task as incomplete',
        spec: admitted({
          acceptPlan: YesNo.NO,
          proceed: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT,
          courtDate: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE,
          suggested: PaymentOptionType.BY_SET_DATE,
        }, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.alternative), complete(TASK.formalise), incomplete(TASK.sign)],
      },
      {
        name: 'should display Request a County Court Judgment task as incomplete after a part admission is formalised',
        spec: admitted({
          acceptPlan: YesNo.NO,
          proceed: ChooseHowProceed.REQUEST_A_CCJ,
          courtDate: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE,
          suggested: PaymentOptionType.BY_SET_DATE,
        }, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.alternative), complete(TASK.formalise), incomplete(TASK.ccj)],
      },
      {
        name: 'should display Sign a settlement agreement task as complete',
        spec: admitted({
          acceptPlan: YesNo.NO,
          proceed: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT,
          signed: YesNo.YES,
          courtDate: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE,
          suggested: PaymentOptionType.BY_SET_DATE,
        }, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.alternative), complete(TASK.formalise), complete(TASK.sign)],
      },
      {
        name: 'should display Request a County Court Judgment task as complete',
        spec: admitted({
          acceptPlan: YesNo.NO,
          proceed: ChooseHowProceed.REQUEST_A_CCJ,
          courtDate: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE,
          suggested: PaymentOptionType.BY_SET_DATE,
          ccjPaid: YesNo.YES,
        }, byDate),
        expected: [complete(TASK.admitted), complete(TASK.repayment), complete(TASK.alternative), complete(TASK.formalise), complete(TASK.ccj)],
      },
    ];

    const fullDefence: NextCase[] = [
      {
        name: 'should display decide wether to proceed task as incomplete for full defense',
        spec: {type: ResponseType.FULL_DEFENCE},
        expected: [incomplete(TASK.proceed)],
      },
      {
        name: 'should display decide wether to proceed task with proceed value as yes as complete with hearing requirements as incomplete and free telephone mediation as incomplete for full defense minti not applicable',
        spec: {type: ResponseType.FULL_DEFENCE, mediation: 'option', response: {intention: YesNo.YES}},
        expected: [complete(TASK.proceed), incomplete(TASK.mediation)],
        hearing: [incomplete(TASK.hearing)],
      },
      {
        name: 'should display decide wether to proceed task with proceed value as no as complete for full defense',
        spec: {type: ResponseType.FULL_DEFENCE, response: {intention: YesNo.NO}},
        expected: [complete(TASK.proceed)],
      },
      {
        name: 'should not display What to do next section for full defense states paid (amount was LESS THAN full amount)',
        spec: fullDefencePaid(8000),
        expected: [],
      },
    ];

    it.each([...fullAdmission, ...partAdmission, ...fullDefence])('$name', ({spec, expected, hearing}) => {
      expectNext(spec, expected, hearing);
    });
  });

  describe('Your response section', () => {
    const paidLess = (response?: ClaimantResponseSpec, extra: ClaimSpec = {}): ClaimSpec => ({
      ...fullDefencePaid(8000, response),
      mockMediation: true,
      ...extra,
    });

    const cases: Array<NextCase & {carm?: boolean; checkUrls?: boolean}> = [
      {
        name: 'should display Your Response section and haveYouBeenPaidTask for full defense states paid (amount was LESS THAN full amount)',
        spec: paidLess(),
        expected: [incomplete(TASK.paid)],
        checkUrls: true,
      },
      {
        name: 'should display haveYouBeenPaidTask and settleClaimForPaidAmountTask as second task for when claimant accepted defendant payment',
        spec: paidLess({paidYou: YesNo.YES}),
        expected: [complete(TASK.paid), incomplete(TASK.settle)],
        checkUrls: true,
      },
      {
        name: 'should display haveYouBeenPaidTask and freeTelephoneMediationTas as second for when claimant doesn`t accept defendant payment',
        spec: paidLess({paidYou: YesNo.NO}),
        expected: [complete(TASK.paid), incomplete(TASK.mediation)],
        checkUrls: true,
      },
      {
        name: 'should display haveYouBeenPaidTask, settleClaimForPaidAmountTask and freeTelephoneMediationTask as third task for when claimant accept defendant payment but not settle the claim',
        spec: paidLess({paidYou: YesNo.YES, partPayment: YesNo.NO, rejection: 'test'}),
        expected: [complete(TASK.paid), complete(TASK.settle), incomplete(TASK.mediation)],
        checkUrls: true,
      },
      {
        name: 'should display haveYouBeenPaidTask and freeTelephoneMediationTas as second for when claimant doesn`t accept defendant payment for Lip v Lr case',
        spec: paidLess({paidYou: YesNo.NO}, {mockMediation: false, mockLrMediation: true}),
        expected: [complete(TASK.paid), incomplete(TASK.mediation)],
        checkUrls: true,
      },
      {
        name: 'should display haveYouBeenPaidTask, settleClaimForPaidAmountTask and freeTelephoneMediationTask as third task for when claimant accept defendant payment but not settle the claim for Lip v Lr case',
        spec: paidLess({paidYou: YesNo.YES, partPayment: YesNo.NO, rejection: 'test'}, {mockMediation: false, mockLrMediation: true}),
        expected: [complete(TASK.paid), complete(TASK.settle), incomplete(TASK.mediation)],
        checkUrls: true,
      },
      {
        name: 'should display amount have been paid task as incomplete',
        spec: {type: ResponseType.PART_ADMISSION, alreadyPaid: YesNo.YES},
        expected: [incomplete(TASK.paid)],
      },
      {
        name: 'should not display free telephone mediation when carm applicable',
        spec: {type: ResponseType.PART_ADMISSION, alreadyPaid: YesNo.YES, mockMediation: true, response: {paidYou: YesNo.NO}},
        carm: true,
        expected: [complete(TASK.paid)],
      },
      {
        name: 'should display free telephone mediation task as incomplete',
        spec: {type: ResponseType.PART_ADMISSION, alreadyPaid: YesNo.YES, mockMediation: true, response: {paidYou: YesNo.NO}},
        expected: [complete(TASK.paid), incomplete(TASK.mediation)],
      },
      {
        name: 'should display settle the claim task as incomplete',
        spec: {type: ResponseType.PART_ADMISSION, alreadyPaid: YesNo.YES, response: {paidYou: YesNo.YES}},
        expected: [complete(TASK.paid), incomplete(TASK.settle)],
      },
      {
        name: 'should display settle the claim task as complete',
        spec: {type: ResponseType.PART_ADMISSION, alreadyPaid: YesNo.YES, response: {paidYou: YesNo.YES, partPayment: YesNo.YES}},
        expected: [complete(TASK.paid), complete(TASK.settle)],
      },
      {
        name: 'should display settle the claim task as complete for full defense states paid',
        spec: {
          type: ResponseType.PART_ADMISSION,
          alreadyPaid: YesNo.YES,
          mockMediation: true,
          spyFullDefenceOnce: true,
          spyPaidInFullOnce: true,
          response: {settled: YesNo.YES},
        },
        expected: [complete(TASK.settle)],
      },
      {
        name: 'should display not settle the claim task as complete for full defense states paid',
        spec: {
          type: ResponseType.PART_ADMISSION,
          alreadyPaid: YesNo.YES,
          mockMediation: true,
          spyFullDefenceOnce: true,
          spyPaidInFullOnce: true,
          response: {settled: YesNo.NO},
        },
        expected: [complete(TASK.settle), incomplete(TASK.mediation)],
      },
    ];

    it.each(cases)('$name', ({spec, expected, carm, checkUrls}) => {
      const section = buildYourResponseSection(buildClaimantResponseClaim(spec), CLAIM_ID, LANG, Boolean(carm));
      expect(section.title).toBe(TASK.yourResponseTitle);
      expectTasks(section.tasks, expected, checkUrls ? {
        [TASK.paid]: urls.paid,
        [TASK.settle]: urls.settle,
        [TASK.mediation]: urls.mediation,
      } : {});
    });
  });

  describe('Mediation section', () => {
    const claim = () => buildClaimantResponseClaim({
      type: ResponseType.FULL_DEFENCE,
      mockMediation: true,
      response: {paidYou: YesNo.NO},
    });

    it('should display mediation when carm applicable', () => {
      const mediation = buildClaimantResponseMediationSection(claim(), CLAIM_ID, LANG, true);
      expectTasks(mediation.tasks, [incomplete(TASK.telephone), incomplete(TASK.availability)]);
    });

    it('should not display mediation when carm not applicable', () => {
      expect(buildClaimantResponseMediationSection(claim(), CLAIM_ID, LANG, false)).toBeUndefined();
    });
  });

  describe('Your hearing requirements section', () => {
    const hearing = (
      name: string,
      expected: HearingSpec['expected'],
      extra: Partial<HearingSpec> = {},
    ): HearingSpec => ({name, expected, ...extra});

    const small = (name: string, adjustment?: HearingAdjustment, expected: HearingSpec['expected'] = TaskStatus.INCOMPLETE): HearingSpec =>
      hearing(name, expected, {amount: 9000, track: 'small', adjustment});

    const fast = (name: string, adjustment?: HearingAdjustment, expected: HearingSpec['expected'] = TaskStatus.INCOMPLETE): HearingSpec =>
      hearing(name, expected, {amount: 24000, track: 'fast', adjustment});

    const cases: HearingSpec[] = [
      hearing('shouldn`t display hearingRequirement section when there is no value for settlement minti not applicable', 'absent', {partAdmitted: 'replaced'}),
      hearing('shouldn`t display hearingRequirement section when claimant rejected settlement for defendent`s partial admission amount minti not applicable', 'absent', {partAdmitted: YesNo.YES}),
      hearing('shouldn`t display hearingRequirement section when claimant accepts defendant paid amount in Full Defence states Paid (when states paid amount was LESS THAN full amount) minti not applicable', 'absent', {partAdmitted: 'cleared', paidYou: YesNo.YES}),
      hearing('shouldn`t display hearingRequirement section when claimant settle claim defendant paid amount in Full Defence states Paid (when states paid amount was LESS THAN full amount)  minti not applicable', 'absent', {partAdmitted: 'cleared', paidYou: YesNo.YES, partPayment: YesNo.YES}),
      small('should display give us details for hearing task as incomplete when claimant rejected settlement for defendent`s partial admission amount minti not applicable'),
      small('should display give us details for hearing task task as incomplete with empty directions questionnaire minti not applicable', 'empty-dq'),
      small('should display give us details for hearing task as incomplete when other witnesses is not available minti not applicable', 'empty-witnesses'),
      small('should display give us details for hearing task as incomplete when phone or video hearing is not available minti not applicable', 'empty-hearing'),
      small('should display give us details for hearing task as incomplete when vulnerability not available minti not applicable', 'empty-vulnerability'),
      small('should display give us details for hearing task as incomplete when welsh language requirements not available minti not applicable', 'empty-welsh'),
      small('should display give us details for hearing task as complete for small claims when all information provided - expert not required scenario minti not applicable', 'small-expert-not-required', TaskStatus.COMPLETE),
      small('should display give us details for hearing task as complete when expert required and expert report details available minti not applicable', 'small-expert-report-yes', TaskStatus.COMPLETE),
      small('should display give us details for hearing task as incomplete when expert required and expert report details not available minti not applicable', 'small-expert-report-no'),
      small('should display give us details for hearing task as complete when expert required, expert report details not available but not wanted to ask for court permission to use an expert minti not applicable', 'small-permission-no', TaskStatus.COMPLETE),
      small('should display give us details for hearing task as incomplete when expert required, expert report details not available but wanted to ask for court permission to use an expert minti not applicable', 'small-permission-yes'),
      small('should display give us details for hearing task as complete when expert required, expert report details not available, wanted to ask for court permission to use an expert but there is nothing expert can still examine minti not applicable', 'small-examine-no', TaskStatus.COMPLETE),
      small('should display give us details for hearing task as incomplete when expert required, expert report details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine minti not applicable', 'small-examine-yes'),
      small('should display give us details for hearing task as complete when expert required, expert report details not available, wanted to ask for court permission to use an expert, there is something expert can still examine but expert details not available minti not applicable', 'small-expert-details', TaskStatus.COMPLETE),
      small('should display give us details for hearing task as incomplete when expert required, expert details not available, wanted to ask for court permission to use an expert and there is something expert can still exomine minti not applicable', 'small-expert-details-missing'),
      fast('should display give us details for hearing task as incomplete when claimant rejected settlement for defendent`s partial admission amount minti not applicable'),
      fast('should display give us details for hearing task task as incomplete with empty directions questionnaire minti not applicable'),
      fast('should display give us details for hearing task as incomplete when other witnesses is not available minti not applicable'),
      fast('should display give us details for hearing task as incomplete when phone or video hearing is not available minti not applicable'),
      fast('should display give us details for hearing task as incomplete when vulnerability not available minti not applicable'),
      fast('should display give us details for hearing task as incomplete when welsh language requirements not available minti not applicable'),
      fast('should display give us details for hearing task as complete for fast track claims when all information provided - expert evidence not used sceneraio minti not applicable', 'fast-no-expert-evidence', TaskStatus.COMPLETE),
      fast('should display give us details for hearing task as incomplete when expert evidence used but sent expert reports not available minti not applicable', 'fast-reports-missing'),
      fast('should display give us details for hearing task as incomplete when expert evidence used and sharing expert with other party not available minti not applicable', 'fast-shared-missing'),
      fast('should display give us details for hearing task as incomplete when expert evidence used used and expert details not available minti not applicable', 'fast-details-empty'),
      fast('should display give us details for hearing task as complete when expert evidence used, sent expert reports, sharedExpert and expert details available minti not applicable', 'fast-expert-complete', TaskStatus.COMPLETE),
      hearing('should display give us details for hearing task as incomplete when claimant rejected settlement for defendent`s partial admission amount', TaskStatus.INCOMPLETE, {amount: 26000, minti: true, track: 'fast'}),
      hearing('should display give us details for hearing task as incomplete documents to consider not complete', TaskStatus.INCOMPLETE, {amount: 26000, minti: true, track: 'fast', adjustment: 'intermediate-documents-missing'}),
      hearing('should display give us details for hearing task as complete', TaskStatus.COMPLETE, {amount: 26000, minti: true, track: 'fast', adjustment: 'intermediate-complete'}),
    ];

    it.each(cases)('$name', scenario => {
      const section = buildClaimantHearingRequirementsSection(buildHearingClaim(scenario), CLAIM_ID, LANG, Boolean(scenario.minti));
      if (scenario.expected === 'absent') {
        expect(section.tasks[0]).toBeUndefined();
        return;
      }
      expectTasks(section.tasks, [[TASK.hearing, scenario.expected]], {
        [TASK.hearing]: scenario.track === 'small' ? urls.small : urls.fast,
      });
    });
  });

  describe('Submit section', () => {
    it('should display check and submit your response task as incomplete', () => {
      expectTasks(buildClaimantResponseSubmitSection(CLAIM_ID, LANG).tasks, [incomplete(TASK.submit)], {[TASK.submit]: urls.submit});
    });
  });
});
