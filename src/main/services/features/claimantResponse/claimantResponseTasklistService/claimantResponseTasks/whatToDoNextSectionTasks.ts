import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
} from 'routes/urls';
import {Task} from 'models/taskList/task';
import {YesNo} from 'common/form/models/yesNo';
import {hasClaimantResponseContactPersonAndCompanyPhone} from 'common/utils/taskList/tasks/taskListHelpers';

export function getAcceptOrRejectDefendantAdmittedTask(claim: Claim, claimId: string, lang: string): Task {
  const accceptOrRejectDefendantAdmittedTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED', {lng: lang, admittedAmount: claim.partialAdmission?.howMuchDoYouOwe?.amount}),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option) {
    accceptOrRejectDefendantAdmittedTask.status = TaskStatus.COMPLETE;
  }
  return accceptOrRejectDefendantAdmittedTask;
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
    if (mediation?.companyTelephoneNumber?.option === YesNo.NO) {
      if (hasClaimantResponseContactPersonAndCompanyPhone(claim)) {
        freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
      }
    } else if (mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation) {
      freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
    }
  }

  return freeTelephoneMediationTask;
}
