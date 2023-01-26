import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL} from 'routes/urls';
import {Task} from 'models/taskList/task';

export function getAcceptOrRejectDefendantAdmittedTask(claim: Claim, claimId: string, lang: string): Task {
  // TODO : This task is just a placeholder and it's part of another story, needs completion logic and replacing mock admittedAmount when developed
  const accceptOrRejectDefendantAdmittedTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.ACCEPT_OR_REJECT_ADMITTED', {lng: lang, admittedAmount : '500'}),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL),
    status: TaskStatus.INCOMPLETE,
  };
  return accceptOrRejectDefendantAdmittedTask;
}
