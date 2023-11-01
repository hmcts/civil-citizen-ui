import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
  CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CLAIMANT_SIGN_SETTLEMENT_AGREEMENT,
  CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL,
  CCJ_EXTENDED_PAID_AMOUNT_URL,
  CLAIMANT_RESPONSE_PAYMENT_OPTION_URL,
} from 'routes/urls';
import {Task} from 'models/taskList/task';
import { YesNo } from 'common/form/models/yesNo';
import {hasClaimantResponseContactPersonAndCompanyPhone} from 'common/utils/taskList/tasks/taskListHelpers';

export function getAcceptOrRejectDefendantAdmittedTask(claim: Claim, claimId: string, lang: string): Task {
  const accceptOrRejectDefendantAdmittedTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED', {
      lng: lang,
      admittedAmount: claim.partialAdmission?.howMuchDoYouOwe?.amount?.toFixed(2),
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option) {
    accceptOrRejectDefendantAdmittedTask.status = TaskStatus.COMPLETE;
  }
  return accceptOrRejectDefendantAdmittedTask;
}

export function getAcceptOrRejectDefendantResponse(claim: Claim, claimId: string, lang: string) {
  const acceptOrTRejectedTheirResponse = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_THEIR_RESPONSE', {
      lng: lang,
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option) {
    acceptOrTRejectedTheirResponse.status = TaskStatus.COMPLETE;
  }
  return acceptOrTRejectedTheirResponse;
}

export function getFullDefenceTask(claim: Claim, claimId: string, lang: string): Task {
  const decideWetherToProceed = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.DECIDE_WHETHER_TO_PROCEED', {
      lng: lang,
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (claim?.claimantResponse?.intentionToProceed?.option) {
    decideWetherToProceed.status = TaskStatus.COMPLETE;
  }
  return decideWetherToProceed;
}

export function getAcceptOrRejectRepaymentTask(claim: Claim, claimId: string, lang: string): Task {
  const acceptOrRejectRepaymentTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_REPAYMENT', {
      lng: lang,
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option) {
    acceptOrRejectRepaymentTask.status = TaskStatus.COMPLETE;
  }
  return acceptOrRejectRepaymentTask;
}

export function getFreeTelephoneMediationTask(claim: Claim, claimId: string, lang: string): Task {
  const freeTelephoneMediationTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.FREE_TELEPHONE_MEDIATION', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_FREE_TELEPHONE_MEDIATION_URL),
    status: TaskStatus.INCOMPLETE,
  };

  const mediation = claim.claimantResponse?.mediation;

  if (mediation?.mediationDisagreement?.option === YesNo.NO) {
    freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
  } else {
    if (mediation?.canWeUse?.option === YesNo.YES || mediation?.canWeUse?.mediationPhoneNumber) {
      freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
    }
    if (mediation?.companyTelephoneNumber?.option === YesNo.NO && hasClaimantResponseContactPersonAndCompanyPhone(claim)) {
      freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
    } else if (mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation) {
      freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
    }
  }
  return freeTelephoneMediationTask;
}

export function getChooseHowFormaliseTask(claim: Claim, claimId: string, lang: string): Task {
  const chooseHowFormaliseTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.HOW_FORMALISE', {
      lng: lang,
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim.claimantResponse?.chooseHowToProceed) {
    chooseHowFormaliseTask.status = TaskStatus.COMPLETE;
  }
  return chooseHowFormaliseTask;
}

export function getSignSettlementAgreementTask(claim: Claim, claimId: string, lang: string): Task {
  const signSettlementAgreementTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.SIGN_SETTLEMENT', {
      lng: lang,
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_SIGN_SETTLEMENT_AGREEMENT),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim.claimantResponse?.signSettlementAgreement) {
    signSettlementAgreementTask.status = TaskStatus.COMPLETE;
  }
  return signSettlementAgreementTask;
}

export function getProposeAlternativeRepaymentTask(claim: Claim, claimId: string, lang: string): Task {
  const proposeAlternativeRepaymentTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.PROPOSE_ALTERNATIVE_REPAYMENT', {
      lng: lang,
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_PAYMENT_OPTION_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if ((claim.isPAPaymentOptionPayImmediately() && claim.claimantResponse?.courtProposedDate?.decision) ||
    (claim.isPAPaymentOptionByDate() && claim.partialAdmission?.paymentIntention?.paymentDate
     && claim.claimantResponse?.suggestedPaymentIntention?.paymentOption)) {
    proposeAlternativeRepaymentTask.status = TaskStatus.COMPLETE;
  }
  return proposeAlternativeRepaymentTask;
}

export function getCountyCourtJudgmentTask(claim: Claim, claimId: string, lang: string): Task {
  const countyCourtJudgmentTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.REQUEST_COUNTY_COURT_JUDGMENT', {
      lng: lang,
    }),
    url: constructResponseUrlWithIdParams(claimId, CCJ_EXTENDED_PAID_AMOUNT_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim.claimantResponse?.ccjRequest?.paidAmount?.option) {
    countyCourtJudgmentTask.status = TaskStatus.COMPLETE;
  }
  return countyCourtJudgmentTask;
}
