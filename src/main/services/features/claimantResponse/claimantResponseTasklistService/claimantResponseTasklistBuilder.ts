import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {Task} from 'common/models/taskList/task';
import {getViewDefendantsReponseTask} from './claimantResponseTasks/howDefendantRespondSectionTaks';
import {getCheckAndSubmitClaimantResponseTask} from './claimantResponseTasks/claimantResponseSubmitSectionTasks';
import {getGiveUsDetailsClaimantHearingTask} from './claimantResponseTasks/claimantHearingRequirementsSectionTasks';
import {
  getAcceptOrRejectDefendantAdmittedTask,
  getAcceptOrRejectDefendantResponse,
  getAcceptOrRejectRepaymentTask,
  getChooseHowFormaliseTask,
  getCountyCourtJudgmentTask,
  getFreeTelephoneMediationTask,
  getFullDefenceTask,
  getProposeAlternativeRepaymentTask,
  getSignSettlementAgreementTask,
} from './claimantResponseTasks/whatToDoNextSectionTasks';
import {YesNo} from 'common/form/models/yesNo';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {
  getHaveYouBeenPaidTask,
  getSettleTheClaimForTask,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/yourResponseSectionTasks';
import { ClaimantResponse } from 'common/models/claimantResponse';
import {getTelephoneMediationTask} from 'common/utils/taskList/tasks/telephoneMediation';
import {getAvailabilityForMediationTask} from 'common/utils/taskList/tasks/availabilityForMediation';

interface TaskRule {
  when: () => boolean;
  tasks: () => Task[];
}

// Rules run in display order. Matching rules append their tasks without deduplication,
// preserving the existing output when several conditions apply to the same claim.
const tasksForRules = (rules: TaskRule[]): Task[] => rules.flatMap(rule => rule.when() ? rule.tasks() : []);

export function buildHowDefendantRespondSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  const viewDefendantsReponseTask = getViewDefendantsReponseTask(claim, claimId, lang);
  tasks.push(viewDefendantsReponseTask);
  return {title: t('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.TITLE', {lng: lang}), tasks};
}

export function buildWhatToDoNextSection(claim: Claim, claimId: string, lang: string) {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const hasMediationAgreement = () => claim.isDefendantAgreedForMediation() || claim.isDefendantLrAgreedForMediation();
  const isFullyPaidDefence = () => claim.hasConfirmedAlreadyPaid() && claim.hasPaidInFull();
  const rules: TaskRule[] = [
    {
      when: () => claim.isFullAdmission(),
      tasks: () => [getAcceptOrRejectRepaymentTask(claim, claimId, lang), ...buildRepaymentPlanTasks(claim, claimId, lang)],
    },
    {
      when: () => !claim.isFullAdmission() && claim.isPartialAdmission(),
      tasks: () => [getAcceptOrRejectDefendantAdmittedTask(claim, claimId, lang), ...tasksForRules([
        {
          when: () => claimantResponse.isClaimantNotAcceptedPartAdmittedAmount && claim.isDefendantAgreedForMediation(),
          tasks: () => [getFreeTelephoneMediationTask(claim, claimId, lang)],
        },
        {
          when: () => claimantResponse.isClaimantAcceptedPartAdmittedAmount && !claim.isPAPaymentOptionPayImmediately(),
          tasks: () => [getAcceptOrRejectRepaymentTask(claim, claimId, lang), ...buildRepaymentPlanTasks(claim, claimId, lang)],
        },
      ])],
    },
    {
      when: () => claim.isFullDefence() && isFullyPaidDefence(),
      tasks: () => [getAcceptOrRejectDefendantResponse(claim, claimId, lang)],
    },
    {
      when: () => claim.isFullDefence() && !isFullyPaidDefence(),
      tasks: () => [getFullDefenceTask(claim, claimId, lang)],
    },
    {
      when: () => claim.hasClaimantIntentToProceedResponse() && hasMediationAgreement(),
      tasks: () => [getFreeTelephoneMediationTask(claim, claimId, lang)],
    },
    {
      when: () => claim.hasClaimantRejectedDefendantResponse() && hasMediationAgreement(),
      tasks: () => [getFreeTelephoneMediationTask(claim, claimId, lang)],
    },
    {
      when: () => isFullDefenceAndPaidNotAcceptPayment(claim),
      tasks: () => [getFreeTelephoneMediationTask(claim, claimId, lang)],
    },
  ];
  const tasks = claim.isFullDefence() && claim.responseStatus === ClaimResponseStatus.RC_PAID_LESS
    ? [] : tasksForRules(rules);
  return {title: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.TITLE', {lng: lang}), tasks};
}

export function buildClaimantResponseMediationSection(claim: Claim, claimId: string, lang: string, carmApplicable: boolean) {
  if (carmApplicable) {
    const tasks: Task[] = [];
    tasks.push(getTelephoneMediationTask(claim, claimId, lang, true));
    tasks.push(getAvailabilityForMediationTask(claim, claimId, lang, true));
    return { title: t('COMMON.MEDIATION', { lng: lang }), tasks };
  }
}

export function buildYourResponseSection(claim: Claim, claimId: string, lang: string, carmApplicable: boolean) {
  const isFullPaid = claim.isFullDefence() && claim.hasPaidInFull();
  const isPartialPaid = (claim.isPartialAdmissionPaid() || claim.responseStatus === ClaimResponseStatus.RC_PAID_LESS);
  const isSettleTheClaim = (isPartialPaid && claim.hasClaimantConfirmedDefendantPaid()) || isFullPaid;
  const isFreePhoneMediation = (claim.isDefendantLrAgreedForMediation() || claim.isDefendantAgreedForMediation())
    && ((isPartialPaid && (claim.hasClaimantRejectedDefendantPaid() || claim.hasClaimantRejectedPartAdmitPayment())) || claim.hasClaimantRejectedDefendantResponse());

  const tasks = tasksForRules([
    {when: () => !isFullPaid, tasks: () => [getHaveYouBeenPaidTask(claim, claimId, lang)]},
    {when: () => isSettleTheClaim, tasks: () => [getSettleTheClaimForTask(claim, claimId, lang)]},
    {when: () => isFreePhoneMediation && !carmApplicable, tasks: () => [getFreeTelephoneMediationTask(claim, claimId, lang)]},
  ]);
  return { title: t('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.TITLE', { lng: lang }), tasks };
}

export function buildClaimantResponseSubmitSection(claimId: string, lang: string) {
  const tasks: Task[] = [];
  const checkAndSubmitYourResponseTask = getCheckAndSubmitClaimantResponseTask(claimId, lang);
  tasks.push(checkAndSubmitYourResponseTask);
  return {title: t('TASK_LIST.SUBMIT.TITLE', {lng: lang}), tasks};
}

export function buildClaimantHearingRequirementsSection(claim: Claim, claimId: string, lang: string, mintiApplicable: boolean) {
  const hearingTask = () => [getGiveUsDetailsClaimantHearingTask(claim, claimId, lang, mintiApplicable)];
  const tasks = tasksForRules([
    {
      when: () => isPartialAdmissionNotAccepted(claim) ||
        isPartialAdmissionPaidAndClaimantRejectPaymentOrNotSettleTheClaim(claim) ||
        isFullDefenceClaimantNotSettleTheClaim(claim) ||
        claim.hasClaimantRejectedDefendantPaid() ||
        claim.hasClaimantRejectedPartAdmitPayment(),
      tasks: hearingTask,
    },
    {when: () => claim.isClaimantIntentionPending() && claim.hasClaimantIntentToProceedResponse(), tasks: hearingTask},
  ]);
  return {title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng: lang}), tasks};
}

const buildRepaymentPlanTasks = (claim: Claim, claimId: string, lang: string): Task[] => {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  const isRejected = claimantResponse.fullAdmitSetDateAcceptPayment?.option === YesNo.NO;
  const isCourtDecisionAccepted = () => claimantResponse.isCourtDecisionInFavourOfClaimant || claimantResponse.isClaimantAcceptsCourtDecision;
  return tasksForRules([
    {when: () => isRejected, tasks: () => [getProposeAlternativeRepaymentTask(claim, claimId, lang)]},
    {
      when: () => claimantResponse.fullAdmitSetDateAcceptPayment?.option === YesNo.YES || (isRejected && isCourtDecisionAccepted()),
      tasks: () => [getChooseHowFormaliseTask(claim, claimId, lang), ...tasksForRules([
        {when: () => claimantResponse.isSignASettlementAgreement, tasks: () => [getSignSettlementAgreementTask(claim, claimId, lang)]},
        {when: () => !claimantResponse.isSignASettlementAgreement && claimantResponse.isCCJRequested, tasks: () => [getCountyCourtJudgmentTask(claim, claimId, lang)]},
      ])],
    },
    {
      when: () => isRejected && !isCourtDecisionAccepted() && claimantResponse.isRequestJudgePaymentPlan,
      tasks: () => [getCountyCourtJudgmentTask(claim, claimId, lang)],
    },
  ]);
};

function isPartialAdmissionNotAccepted(claim: Claim) : boolean {
  return (claim.isClaimantIntentionPending() && claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO);
}

function isPartialAdmissionPaidAndClaimantRejectPaymentOrNotSettleTheClaim(claim: Claim) : boolean {
  return claim.isPartialAdmissionPaid() && ((claim.hasClaimantRejectedDefendantPaid() || claim.hasClaimantRejectedPartAdmitPayment()));
}

function isFullDefenceClaimantNotSettleTheClaim(claim: Claim) : boolean {
  return claim.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option === YesNo.NO;
}

function isFullDefenceAndPaidNotAcceptPayment(claim: Claim) : boolean {
  return (claim?.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.NO
    && claim.isFullDefence()
    && claim.responseStatus === ClaimResponseStatus.RC_PAID_FULL);
}
