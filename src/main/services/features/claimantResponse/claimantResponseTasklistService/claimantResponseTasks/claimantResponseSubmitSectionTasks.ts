import {t} from 'i18next';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {Task} from 'models/taskList/task';

export function getCheckAndSubmitClaimantResponseTask (claimId: string, lang: string): Task {
  return {
    description: t('TASK_LIST.SUBMIT.CHECK_AND_SUBMIT', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHECK_ANSWERS_URL),
    status: TaskStatus.INCOMPLETE,
    isCheckTask: true,
  };
}
