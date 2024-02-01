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
import {
  getClaimantMediationAvailabilityTask,
  getClaimantTelephoneMediationTask,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/mediationSectionTasks';

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
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);

  if (claim.isFullDefence() && claim.responseStatus === ClaimResponseStatus.RC_PAID_LESS) {
    return {title: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.TITLE', {lng: lang}), tasks};
  }

  if (claim.isFullAdmission()) {
    tasks.push(acceptOrRejectRepaymentPlanTask);
    handleAcceptOrRejectRepaymentPlanTask(claim, claimId, lang, tasks);
  } else if (claim.isPartialAdmission()) {
    tasks.push(acceptOrRejectDefendantAdmittedTask);
    if (claimantResponse.isClaimantNotAcceptedPartAdmittedAmount && claim.isDefendantAgreedForMediation()) {
      tasks.push(freeTelephoneMediationTask);
    } else if (claimantResponse.isClaimantAcceptedPartAdmittedAmount && !claim.isPAPaymentOptionPayImmediately()) {
      tasks.push(acceptOrRejectRepaymentPlanTask);
      handleAcceptOrRejectRepaymentPlanTask(claim, claimId, lang, tasks);
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

export function buildClaimantResponseMediationSection(claim: Claim, claimId: string, lang: string, carmApplicable: boolean) {
  if (carmApplicable) {
    const tasks: Task[] = [];
    tasks.push(getClaimantTelephoneMediationTask(claim, claimId, lang));
    tasks.push(getClaimantMediationAvailabilityTask(claim, claimId, lang));
    return { title: t('COMMON.MEDIATION', { lng: lang }), tasks };
  }
}

export function buildYourResponseSection(claim: Claim, claimId: string, lang: string, carmApplicable: boolean) {
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
  if (isFreePhoneMediation && !carmApplicable) {
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

const addFormaliseAndSignOrRequestTask = (claimantResponse: ClaimantResponse, signSettlementAgreement: Task, countyCourtJudgmentTask: Task, chooseHowToFormaliseRepaymentPlanTask: Task, tasks: Task[]) => {
  tasks.push(chooseHowToFormaliseRepaymentPlanTask);
  if (claimantResponse.isSignASettlementAgreement) {
    tasks.push(signSettlementAgreement);
  } else if (claimantResponse.isCCJRequested) {
    tasks.push(countyCourtJudgmentTask);
  }
};

const handleAcceptOrRejectRepaymentPlanTask = (claim: Claim, claimId: string, lang: string, tasks: Task[]) => {
  const chooseHowToFormaliseRepaymentPlanTask = getChooseHowFormaliseTask(claim, claimId, lang);
  const proposeAlternativeRepaymentTask = getProposeAlternativeRepaymentTask(claim, claimId, lang);
  const countyCourtJudgmentTask = getCountyCourtJudgmentTask(claim, claimId, lang);
  const signSettlementAgreementTask = getSignSettlementAgreementTask(claim, claimId, lang);
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);

  if (claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.YES) {
    addFormaliseAndSignOrRequestTask(claimantResponse, signSettlementAgreementTask, countyCourtJudgmentTask, chooseHowToFormaliseRepaymentPlanTask, tasks);
  } else if (claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO) {
    tasks.push(proposeAlternativeRepaymentTask);
    if (claimantResponse.isCourtDecisionInFavourOfClaimant || claimantResponse.isClaimantAcceptsCourtDecision) {
      addFormaliseAndSignOrRequestTask(claimantResponse, signSettlementAgreementTask, countyCourtJudgmentTask, chooseHowToFormaliseRepaymentPlanTask, tasks);
    } else if (claimantResponse.isRequestJudgePaymentPlan) {
      tasks.push(countyCourtJudgmentTask);
    }
  }
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
