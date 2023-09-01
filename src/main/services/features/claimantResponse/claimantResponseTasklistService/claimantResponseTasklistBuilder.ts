import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {Task} from 'common/models/taskList/task';
import {getViewDefendantsReponseTask} from './claimantResponseTasks/howDefendantRespondSectionTaks';
import {getCheckAndSubmitClaimantResponseTask} from './claimantResponseTasks/claimantResponseSubmitSectionTasks';
import {getGiveUsDetailsClaimantHearingTask} from './claimantResponseTasks/claimantHearingRequirementsSectionTasks';
import {
  getAcceptOrRejectDefendantAdmittedTask,
  getAcceptOrRejectRepaymentTask,
  getChooseHowFormaliseTask,
  getCountyCourtJudgmentTask,
  getFreeTelephoneMediationTask,
  getProposeAlternativeRepaymentTask,
  getSignSettlementAgreementTask,
} from './claimantResponseTasks/whatToDoNextSectionTasks';
import {YesNo} from 'common/form/models/yesNo';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';

export function buildHowDefendantRespondSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  const viewDefendantsReponseTask = getViewDefendantsReponseTask(claim, claimId, lang);
  tasks.push(viewDefendantsReponseTask);
  return {title: t('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.TITLE', {lng: lang}), tasks};
}

export function buildWhatToDoNextSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];

  if (claim.isFullAdmission()) {


    // if (claim.isFAPaymentOptionBySetDate()) {

    // } else if (claim.isFAPaymentOptionInstallments()) {

    // }

    const acceptOrRejectRepaymentPlanTask = getAcceptOrRejectRepaymentTask(claim, claimId, lang);
    tasks.push(acceptOrRejectRepaymentPlanTask);
    
    const chooseHowToFormaliseRepaymentPlanTask = getChooseHowFormaliseTask(claim, claimId, lang);
    
    if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.YES) {
      tasks.push(chooseHowToFormaliseRepaymentPlanTask);
    } else if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO) {
      const proposeAlternativeRepaymentTask = getProposeAlternativeRepaymentTask(claim, claimId, lang);
      tasks.push(proposeAlternativeRepaymentTask);

      // AND Court calculator says Defendant can't afford your plan 
      // AND select "yes" radio button and click "Save and continue" under "The defendant can’t pay by your proposed date" screen (/claimant-response/court-offered-set-date
      // tasks.push(chooseHowToFormaliseRepaymentPlanTask);
    }
    
    if (claim.isSignASettlementAgreement()) {
      const getSsignSettlementAgreementTask = getSignSettlementAgreementTask(claim, claimId, lang);
      tasks.push(getSsignSettlementAgreementTask);
    } else if (claim.isRequestACCJ()) {
      const countyCourtJudgmentTask = getCountyCourtJudgmentTask(claim, claimId, lang);
      tasks.push(countyCourtJudgmentTask);
    }
    

  } else if (claim.isPartialAdmission()) {
    const acceptOrRejectDefendantAdmittedTask = getAcceptOrRejectDefendantAdmittedTask(claim, claimId, lang);
    tasks.push(acceptOrRejectDefendantAdmittedTask);
    
    if (claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO) {
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      tasks.push(freeTelephoneMediationTask);

    } else if (claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.YES) {
      const acceptOrRejectRepayment = getAcceptOrRejectRepaymentTask(claim, claimId, lang);
      tasks.push(acceptOrRejectRepayment);

      if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.YES) {
        const proposeAlternativeRepayment = getProposeAlternativeRepaymentTask(claim, claimId, lang);
        tasks.push(proposeAlternativeRepayment);

        if ((claim.isPAPaymentOptionPayImmediately() && claim.claimantResponse?.courtProposedDate?.decision) ||
          (claim.isPAPaymentOptionByDate() && claim.partialAdmission?.paymentIntention?.paymentDate)) {
          const chooseHowFormaliseTask = getChooseHowFormaliseTask(claim, claimId, lang);
          tasks.push(chooseHowFormaliseTask);
        }

      } else if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO) {
        const proposeAlternativeRepayment = getProposeAlternativeRepaymentTask(claim, claimId, lang);
        tasks.push(proposeAlternativeRepayment);
      }

      if (claim.claimantResponse?.chooseHowToProceed?.option === ChooseHowProceed.REQUEST_A_CCJ) {
        const countyCourtJudgment = getCountyCourtJudgmentTask(claim, claimId, lang);
        tasks.push(countyCourtJudgment);
      } else if (claim.claimantResponse?.chooseHowToProceed?.option === ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT) {
        const signSettlementAgreement = getSignSettlementAgreementTask(claim, claimId, lang);
        tasks.push(signSettlementAgreement);
      }
    }

  }

  return {title: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.TITLE', {lng: lang}), tasks};
}

export function buildClaimantResponseSubmitSection(claimId: string, lang: string) {
  const tasks: Task[] = [];
  const checkAndSubmitYourResponseTask = getCheckAndSubmitClaimantResponseTask(claimId, lang);
  tasks.push(checkAndSubmitYourResponseTask);
  return {title: t('TASK_LIST.SUBMIT.TITLE', {lng: lang}), tasks};
}

export function buildClaimantHearingRequirementsSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  if (claim.isClaimantIntentionPending() && claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO) {
    const giveUsDetailsClaimantHearingTask = getGiveUsDetailsClaimantHearingTask(claim, claimId, lang);
    tasks.push(giveUsDetailsClaimantHearingTask);
  }
  return {title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng: lang}), tasks};
}
