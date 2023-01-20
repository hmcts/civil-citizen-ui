import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {isCaseDataMissing, isResponseTypeMissing} from 'common/utils/taskList/tasks/taskListHelpers';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL} from 'routes/urls';
import {Task} from 'models/taskList/task';

export function getViewDefendantsReponseTask (claim: Claim, claimId: string, lang: string): Task {
  // update complete status
  // defendantResponseViewed
  const viewDefendantsReponseTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.VIEW_DEFENDANTS_RESPONSE', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (isCaseDataMissing(claim) || isResponseTypeMissing(claim?.respondent1)) {
    viewDefendantsReponseTask.status = TaskStatus.INCOMPLETE;
  }
  return viewDefendantsReponseTask;
}
