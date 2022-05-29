import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_PAYMENT_OPTION_URL} from '../../../../routes/urls';
import {isPaymentOptionMissing} from './taskListHelpers';

const decideHowYouPayTask: Task = {
  description: 'Decide how you\'ll pay',
  url: CITIZEN_PAYMENT_OPTION_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getDecideHowYouPayTask = (caseData: Claim, claimId: string): Task => {
  let taskStatus = TaskStatus.COMPLETE;
  if (isPaymentOptionMissing(caseData)) {
    taskStatus = TaskStatus.INCOMPLETE;
  }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);
  return { ...decideHowYouPayTask, url: constructedUrl, status: taskStatus };
};
