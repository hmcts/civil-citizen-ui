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
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
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
  if (claim.isFullDefence() && claim.responseStatus === ClaimResponseStatus.RC_PAID_LESS) {
    return {title: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.TITLE', {lng: lang}), tasks};
  }
  if (claim.isFullAdmission()) {

    const acceptOrRejectRepaymentPlanTask = getAcceptOrRejectRepaymentTask(claim, claimId, lang);
    tasks.push(acceptOrRejectRepaymentPlanTask);

    if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.YES) {
      const chooseHowToFormaliseRepaymentPlanTask = getChooseHowFormaliseTask(claim, claimId, lang);
      tasks.push(chooseHowToFormaliseRepaymentPlanTask);
      if (claim.isSignASettlementAgreement()) {
        const getSsignSettlementAgreementTask = getSignSettlementAgreementTask(claim, claimId, lang);
        tasks.push(getSsignSettlementAgreementTask);
      } else if (claim.isRequestACCJ()) {
        const countyCourtJudgmentTask = getCountyCourtJudgmentTask(claim, claimId, lang);
        tasks.push(countyCourtJudgmentTask);
      }
    } else if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO) {
      const proposeAlternativeRepaymentTask = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      tasks.push(proposeAlternativeRepaymentTask);
      if (isClaimantFavourAndCanShowChooseHowFormaliseTask(claim)) {
        const chooseHowFormaliseTask = getChooseHowFormaliseTask(claim, claimId, lang);
        tasks.push(chooseHowFormaliseTask);
      } else if (isRequestJudgePaymentPlan(claim)) {
        const countyCourtJudgmentTask = getCountyCourtJudgmentTask(claim, claimId, lang);
        tasks.push(countyCourtJudgmentTask);
      }
    }

  } else if (claim.isPartialAdmission()) {
    const acceptOrRejectDefendantAdmittedTask = getAcceptOrRejectDefendantAdmittedTask(claim, claimId, lang);
    tasks.push(acceptOrRejectDefendantAdmittedTask);

    if (claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO) {
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      tasks.push(freeTelephoneMediationTask);

    } else if (claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option ===  YesNo.YES && (claim.isPAPaymentOptionByDate() || claim.isPAPaymentOptionInstallments())) {
      const acceptOrRejectRepayment = getAcceptOrRejectRepaymentTask(claim, claimId, lang);
      tasks.push(acceptOrRejectRepayment);

      if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.YES && canShowChooseHowFormaliseTask(claim)) {
        const chooseHowFormaliseTask = getChooseHowFormaliseTask(claim, claimId, lang);
        tasks.push(chooseHowFormaliseTask);
      } else if (claim?.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO) {
        const proposeAlternativeRepayment = getProposeAlternativeRepaymentTask(claim, claimId, lang);
        tasks.push(proposeAlternativeRepayment);
        if (isClaimantFavourAndCanShowChooseHowFormaliseTask(claim)) {
          const chooseHowFormaliseTask = getChooseHowFormaliseTask(claim, claimId, lang);
          tasks.push(chooseHowFormaliseTask);
        } else if (isRequestJudgePaymentPlan(claim)) {
          const countyCourtJudgmentTask = getCountyCourtJudgmentTask(claim, claimId, lang);
          tasks.push(countyCourtJudgmentTask);
        }
      }

      if (claim?.claimantResponse?.chooseHowToProceed?.option === ChooseHowProceed.REQUEST_A_CCJ) {
        const countyCourtJudgment = getCountyCourtJudgmentTask(claim, claimId, lang);
        tasks.push(countyCourtJudgment);
      } else if (claim.claimantResponse?.chooseHowToProceed?.option === ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT) {
        const signSettlementAgreement = getSignSettlementAgreementTask(claim, claimId, lang);
        tasks.push(signSettlementAgreement);
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
    const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
    tasks.push(freeTelephoneMediationTask);
  }

  if (claim?.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option === YesNo.NO) {
    const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
    tasks.push(freeTelephoneMediationTask);
  }

  if (isFullDefenceAndPaidNotAcceptPayment(claim)) {
    const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
    tasks.push(freeTelephoneMediationTask);
  }

  return {title: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.TITLE', {lng: lang}), tasks};
}

export function buildYourResponseSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  const isFullPaid = claim.isFullDefence() && claim.hasPaidInFull();
  const isPartialPaid = (claim.isPartialAdmissionPaid() || claim.responseStatus === ClaimResponseStatus.RC_PAID_LESS);
  const isSettleTheClaim = (isPartialPaid && claim.hasClaimantConfirmedDefendantPaid()) || isFullPaid;
  const isFreePhoneMediation = (isPartialPaid && (claim.hasClaimantRejectedDefendantPaid() || claim.hasClaimantRejectedPartAdmitPayment())) || claim.hasClaimantRejectedDefendantResponse();

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

function isPartialAdmissionNotAccepted(claim: Claim) : boolean {
  return (claim.isClaimantIntentionPending() && claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO);
}

function isPartialAdmissionPaidAndClaimantRejectPaymentOrNotSettleTheClaim(claim: Claim) : boolean {
  return claim.isPartialAdmissionPaid() && ((claim.hasClaimantRejectedDefendantPaid() || claim.hasClaimantRejectedPartAdmitPayment()));
}

function isFullDefenceClaimantNotSettleTheClaim(claim: Claim) : boolean {
  return claim.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option === YesNo.NO;
}

function canShowChooseHowFormaliseTask(claim: Claim) : boolean {
  return ((claim.isPAPaymentOptionPayImmediately() && !!claim.claimantResponse?.courtProposedDate?.decision) ||
  (claim.isPAPaymentOptionByDate() && !!claim.partialAdmission?.paymentIntention?.paymentDate) ||
  (claim.isPAPaymentOptionInstallments() && !!claim.partialAdmission?.paymentIntention?.repaymentPlan));
}

function isClaimantFavourAndCanShowChooseHowFormaliseTask(claim: Claim) : boolean {
  return claim.claimantResponse?.courtProposedDate?.decision === CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE ||
  claim.claimantResponse?.courtProposedPlan?.decision === CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN ||
  claim.claimantResponse?.courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
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
