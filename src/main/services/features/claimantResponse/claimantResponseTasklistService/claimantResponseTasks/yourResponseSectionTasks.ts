import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
  CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
} from 'routes/urls';
import {Task} from 'models/taskList/task';
import {YesNo} from 'common/form/models/yesNo';
import {hasClaimantResponseContactPersonAndCompanyPhone} from 'common/utils/taskList/tasks/taskListHelpers';

export function getHaveYouBeenPaidTask(claim: Claim, claimId: string, lang: string): Task {
  const haveYouBeenPaidTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.HAVE_BEEN_PAID', {
      lng: lang,
      paidAmount: claim.partialAdmissionPaidAmount(),
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim.claimantResponse?.hasDefendantPaidYou?.option) {
    haveYouBeenPaidTask.status = TaskStatus.COMPLETE;
  }
  return haveYouBeenPaidTask;
}

export function getSettleTheClaimForTask(claim: Claim, claimId: string, lang: string): Task {
  const settleTheClaimForTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.SETTLE_CLAIM_FOR', {
      lng: lang,
      paidAmount: claim.partialAdmissionPaidAmount(),
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_CLAIM_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim.claimantResponse?.hasPartPaymentBeenAccepted?.option) {
    settleTheClaimForTask.status = TaskStatus.COMPLETE;
  }
  return settleTheClaimForTask;
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

