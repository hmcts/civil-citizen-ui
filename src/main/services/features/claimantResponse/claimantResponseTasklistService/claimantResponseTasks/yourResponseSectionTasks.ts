import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL,
} from 'routes/urls';
import {Task} from 'models/taskList/task';
import {YesNo} from 'common/form/models/yesNo';

export function getHaveYouBeenPaidTask(claim: Claim, claimId: string, lang: string): Task {
  const paidAmount = claim.isRejectAllOfClaimAlreadyPaid();
  const haveYouBeenPaid = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.HAVE_YOU_BEEN_PAID', {
      lng: lang,
      statedPaidAmount: paidAmount,
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (claim?.claimantResponse?.hasDefendantPaidYou?.option) {
    haveYouBeenPaid.status = TaskStatus.COMPLETE;
  }
  return haveYouBeenPaid;
}

export function getSettleClaimForPaidAmount(claim: Claim, claimId: string, lang: string): Task {
  const paidAmount = claim.isRejectAllOfClaimAlreadyPaid();
  const settleClaimForPaidAmount = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.YOUR_RESPONSE.SETTLE_THE_CLAIM', {
      lng: lang,
      statedPaidAmount: paidAmount,
    }),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_CLAIM_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (claim?.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.YES ||
    (claim?.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.NO && claim?.claimantResponse?.rejectionReason?.text)) {
    settleClaimForPaidAmount.status = TaskStatus.COMPLETE;
  }
  return settleClaimForPaidAmount;
}
