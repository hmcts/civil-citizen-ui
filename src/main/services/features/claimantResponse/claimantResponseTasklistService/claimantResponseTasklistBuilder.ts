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
  getProposeAlternativeRepaymentTask,
  getSignSettlementAgreementTask,
} from './claimantResponseTasks/whatToDoNextSectionTasks';
import {YesNo} from 'common/form/models/yesNo';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import { toNumberOrUndefined } from 'common/utils/numberConverter';

export function buildHowDefendantRespondSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  const viewDefendantsReponseTask = getViewDefendantsReponseTask(claim, claimId, lang);
  tasks.push(viewDefendantsReponseTask);
  return {title: t('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.TITLE', {lng: lang}), tasks};
}

export function buildWhatToDoNextSection(claim: Claim, claimId: string, lang: string) {
  const tasks: Task[] = [];
  if (claim?.isPartialAdmission()) {
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

      } else if (claim?.claimantResponse?.fullAdmitSetDateAcceptPayment?.option === YesNo.NO) {
        const proposeAlternativeRepayment = getProposeAlternativeRepaymentTask(claim, claimId, lang);
        tasks.push(proposeAlternativeRepayment);
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

  if (claim?.isFullDefence()) {
    if (claim?.hasConfirmedAlreadyPaid() && (toNumberOrUndefined(claim?.rejectAllOfClaim.howMuchHaveYouPaid?.amount as unknown as string) === (claim.totalClaimAmount * 100))) {
      tasks.push(getAcceptOrRejectDefendantResponse(claim, claimId, lang));
    }
    if (claim?.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option === YesNo.NO) {
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      tasks.push(freeTelephoneMediationTask);
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
  if (claim.isClaimantIntentionPending() && (claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO || claim.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option === YesNo.NO)) {
    const giveUsDetailsClaimantHearingTask = getGiveUsDetailsClaimantHearingTask(claim, claimId, lang);
    tasks.push(giveUsDetailsClaimantHearingTask);
  }
  return {title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng: lang}), tasks};
}
