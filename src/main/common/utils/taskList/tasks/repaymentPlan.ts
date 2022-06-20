import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_REPAYMENT_PLAN} from '../../../../routes/urls';
import {isRepaymentPlanMissing} from './taskListHelpers';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getRepaymentPlanTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const repaymentPlanTask: Task = {
  description: t('TASK_LIST.RESPOND_TO_CLAIM.YOUR_REPAYMENT_PLAN', { lng: getLng(lang) }),
  url: CITIZEN_REPAYMENT_PLAN,
  status: TaskStatus.INCOMPLETE,
  };
  let taskStatus = TaskStatus.INCOMPLETE;

  if(!isRepaymentPlanMissing(caseData)) {
    taskStatus = TaskStatus.COMPLETE;
  }

  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN);
  return { ...repaymentPlanTask, url: constructedUrl, status: taskStatus };
};
