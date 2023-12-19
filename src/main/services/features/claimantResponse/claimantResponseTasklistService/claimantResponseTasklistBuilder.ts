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
import {CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {CourtProposedPlanOptions} from 'form/models/claimantResponse/courtProposedPlan';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';

export function buildHowDefendantRespondSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  const viewDefendantsReponseTask = getViewDefendantsReponseTask(claim, claimId, lang);
  tasks.push(viewDefendantsReponseTask);
  return {title: t('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.TITLE', {lng: lang}), tasks};
}

export function buildWhatToDoNextSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  const acceptOrRejectDefendantAdmittedTask = getAcceptOrRejectDefendantAdmittedTask(claim, claimId, lang);
  const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
  const acceptOrRejectRepaymentPlanTask = getAcceptOrRejectRepaymentTask(claim, claimId, lang);
  const chooseHowToFormaliseRepaymentPlanTask = getChooseHowFormaliseTask(claim, claimId, lang);
  const proposeAlternativeRepaymentTask = getProposeAlternativeRepaymentTask(claim, claimId, lang);
  const countyCourtJudgmentTask = getCountyCourtJudgmentTask(claim, claimId, lang);
  const signSettlementAgreementTask = getSignSettlementAgreementTask(claim, claimId, lang);

  if (claim.isFullDefence() && claim.responseStatus === ClaimResponseStatus.RC_PAID_LESS) {
    return {title: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.TITLE', {lng: lang}), tasks};
  }

  if (claim.isFullAdmission()) {
    tasks.push(acceptOrRejectRepaymentPlanTask);

    if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.YES) {
      tasks.push(chooseHowToFormaliseRepaymentPlanTask);
      if (claim.isSignASettlementAgreement()) {
        tasks.push(signSettlementAgreementTask);
      } else if (claim.isRequestACCJ()) {
        tasks.push(countyCourtJudgmentTask);
      }
    } else if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO) {
      tasks.push(proposeAlternativeRepaymentTask);
      if (isAcceptCourtProposedPayment(claim) || claim.courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT) {
        tasks.push(chooseHowToFormaliseRepaymentPlanTask);
      } else if (isRequestJudgePaymentPlan(claim)) {
        tasks.push(countyCourtJudgmentTask);
      }
    }

  } else if (claim.isPartialAdmission()) {
    tasks.push(acceptOrRejectDefendantAdmittedTask);
    if (claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO) {
      tasks.push(freeTelephoneMediationTask);
    } else if (claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.YES) {
      tasks.push(acceptOrRejectRepaymentPlanTask);
      if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.YES) {
        tasks.push(chooseHowToFormaliseRepaymentPlanTask);
        addSignOrRequestTask(claim, signSettlementAgreementTask, countyCourtJudgmentTask, tasks);
      } else if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO) {
        tasks.push(proposeAlternativeRepaymentTask);
        if (claim.claimantResponse?.courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT) {
          tasks.push(chooseHowToFormaliseRepaymentPlanTask);
          addSignOrRequestTask(claim, signSettlementAgreementTask, countyCourtJudgmentTask, tasks);
        } else if (claim.claimantResponse?.courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT) {
          if (isAcceptCourtProposedPayment(claim)) {
            tasks.push(chooseHowToFormaliseRepaymentPlanTask);
            addSignOrRequestTask(claim, signSettlementAgreementTask, countyCourtJudgmentTask, tasks);
          } else if (isRequestJudgePaymentPlan(claim)) {
            tasks.push(countyCourtJudgmentTask);
          }
        }
      }
    }
  }

  if (claim.isFullDefence()) {
    if (claim?.hasConfirmedAlreadyPaid() && claim.hasPaidInFull()) {
      tasks.push(getAcceptOrRejectDefendantResponse(claim, claimId, lang));
    } else {
      const decideWetherToProceed = getFullDefenceTask(claim, claimId, lang);
      tasks.push(decideWetherToProceed);
    }
  }

  if (claim?.claimantResponse?.intentionToProceed?.option === YesNo.YES && claim.isDefendantAgreedForMediation()) {
    tasks.push(freeTelephoneMediationTask);
  }

  if (claim?.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option === YesNo.NO && claim.isDefendantAgreedForMediation())  {
    tasks.push(freeTelephoneMediationTask);
  }

  if (isFullDefenceAndPaidNotAcceptPayment(claim)) {
    tasks.push(freeTelephoneMediationTask);
  }

  return {title: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.TITLE', {lng: lang}), tasks};
}

export function buildYourResponseSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  const isFullPaid = claim.isFullDefence() && claim.hasPaidInFull();
  const isPartialPaid = (claim.isPartialAdmissionPaid() || claim.responseStatus === ClaimResponseStatus.RC_PAID_LESS);
  const isSettleTheClaim = (isPartialPaid && claim.hasClaimantConfirmedDefendantPaid()) || isFullPaid;
  const isFreePhoneMediation = claim.isDefendantAgreedForMediation() && ((isPartialPaid && (claim.hasClaimantRejectedDefendantPaid() || claim.hasClaimantRejectedPartAdmitPayment())) || claim.hasClaimantRejectedDefendantResponse());

  if (!isFullPaid) {
    const haveYouBeenPaidTask = getHaveYouBeenPaidTask(claim, claimId, lang);
    tasks.push(haveYouBeenPaidTask);
  }
  if (isSettleTheClaim) {
    tasks.push(getSettleTheClaimForTask(claim, claimId, lang));
  }
  if (isFreePhoneMediation) {
    tasks.push(getFreeTelephoneMediationTask(claim, claimId, lang));
  }
  return { title: t('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.TITLE', { lng: lang }), tasks };
}

export function buildClaimantResponseSubmitSection(claimId: string, lang: string) {
  const tasks: Task[] = [];
  const checkAndSubmitYourResponseTask = getCheckAndSubmitClaimantResponseTask(claimId, lang);
  tasks.push(checkAndSubmitYourResponseTask);
  return {title: t('TASK_LIST.SUBMIT.TITLE', {lng: lang}), tasks};
}

export function buildClaimantHearingRequirementsSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  if (isPartialAdmissionNotAccepted(claim) ||
    isPartialAdmissionPaidAndClaimantRejectPaymentOrNotSettleTheClaim(claim) ||
    isFullDefenceClaimantNotSettleTheClaim(claim) ||
    claim.hasClaimantRejectedDefendantPaid() ||
    claim.hasClaimantRejectedPartAdmitPayment()) {
    const giveUsDetailsClaimantHearingTask = getGiveUsDetailsClaimantHearingTask(claim, claimId, lang);
    tasks.push(giveUsDetailsClaimantHearingTask);
  }

  if (claim.isClaimantIntentionPending() && claim?.claimantResponse?.intentionToProceed?.option === YesNo.YES) {
    const giveUsDetailsClaimantHearingTask = getGiveUsDetailsClaimantHearingTask(claim, claimId, lang);
    tasks.push(giveUsDetailsClaimantHearingTask);
  }
  return {title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng: lang}), tasks};
}

const addSignOrRequestTask = (claim: Claim, signSettlementAgreement: Task, countyCourtJudgmentTask: Task, tasks: Task[]) => {
  if (claim.isSignASettlementAgreement()) {
    tasks.push(signSettlementAgreement);
  } else if (claim.isRequestACCJ()) {
    tasks.push(countyCourtJudgmentTask);
  }
  return tasks;
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

function isAcceptCourtProposedPayment(claim: Claim) : boolean {
  return claim.claimantResponse?.courtProposedDate?.decision === CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE ||
    claim.claimantResponse?.courtProposedPlan?.decision === CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN;
}

function isRequestJudgePaymentPlan(claim: Claim) : boolean {
  return claim.claimantResponse?.courtProposedDate?.decision === CourtProposedDateOptions.JUDGE_REPAYMENT_DATE ||
    claim.claimantResponse?.courtProposedPlan?.decision === CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN;
}

function isFullDefenceAndPaidNotAcceptPayment(claim: Claim) : boolean {
  return (claim?.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.NO
    && claim.isFullDefence()
    && claim.responseStatus === ClaimResponseStatus.RC_PAID_FULL);
}
