import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
} from 'routes/urls';
import {Task} from 'models/taskList/task';

export function getHaveYouBeenPaidTask(claim: Claim, claimId: string, lang: string): Task {
  const haveYouBeenPaidTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.HAVE_BEEN_PAID', {
      lng: lang,
      paidAmount: claim.isFullDefence() ? claim.isRejectAllOfClaimAlreadyPaid() : claim.partialAdmissionPaidAmount(),
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
      paidAmount: claim.isFullDefence() ? claim.isRejectAllOfClaimAlreadyPaid() : claim.partialAdmissionPaidAmount(),
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_CLAIM_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (claim?.isClaimantSettleTheClaimForDefendantPartlyPaidAmount() ||
    (claim?.isClaimantRejectSettleTheClaimForDefendantPartlyPaidAmount() && claim?.claimantResponse?.rejectionReason?.text)) {
    settleTheClaimForTask.status = TaskStatus.COMPLETE;
  }
  return settleTheClaimForTask;
}
