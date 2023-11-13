import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {RESPONSE_YOUR_DEFENCE_URL} from '../../../../routes/urls';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getTestCarmTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const testCarmTask: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.TEST_CARM', {lng: getLng(lang)}),
    url: constructResponseUrlWithIdParams(claimId, RESPONSE_YOUR_DEFENCE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.rejectAllOfClaim?.defence?.text) {
    testCarmTask.status = TaskStatus.COMPLETE;
  }

  return testCarmTask;
};
