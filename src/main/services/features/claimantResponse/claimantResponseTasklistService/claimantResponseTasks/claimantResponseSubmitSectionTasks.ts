import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {Task} from 'models/taskList/task';

export function getCheckAndSubmitClaimantResponseTask (claim: Claim, claimId: string, lang: string): Task {
  const checkAndSubmitClaimantResponseTask = {
    description: t('TASK_LIST.SUBMIT.CHECK_AND_SUBMIT', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHECK_ANSWERS_URL),
    status: TaskStatus.INCOMPLETE,
    isCheckTask: true,
  };

  if (!claim.isClaimantIntentionPending() && claim.isClaimantIntentionSubmitted()) {
    checkAndSubmitClaimantResponseTask.status = TaskStatus.COMPLETE;
  }
  return checkAndSubmitClaimantResponseTask;
}
