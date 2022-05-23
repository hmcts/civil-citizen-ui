import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_REPAYMENT_PLAN} from '../../../../routes/urls';
import {isRepaymentPlanMissing} from 'common/utils/taskList/tasks/taskListHelpers';

const repaymentPlanTask: Task = {
  description: 'Your repayment plan',
  url: CITIZEN_REPAYMENT_PLAN,
  status: TaskStatus.INCOMPLETE,
};

export const getRepaymentPlanTask = (caseData: Claim, claimId: string): Task => {
  let taskStatus = TaskStatus.INCOMPLETE;

  if(!isRepaymentPlanMissing(caseData)) {
    taskStatus = TaskStatus.COMPLETE;
  }

  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN);
  return { ...repaymentPlanTask, url: constructedUrl, status: taskStatus };
};
