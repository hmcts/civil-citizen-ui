import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {SUPPORT_REQUIRED_URL} from '../../../../routes/urls';
// import {isPaymentOptionMissing} from './taskListHelpers';

const giveUsDetailsHearingTask: Task = {
  description: 'Give us details in case there´s a hearing',
  url: SUPPORT_REQUIRED_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getGiveUsDetailsHearingTask = (caseData: Claim, claimId: string): Task => {
  let taskStatus = TaskStatus.INCOMPLETE;
  // if (isPaymentOptionMissing(caseData)) {
  //   taskStatus = TaskStatus.COMPLETE;
  // }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, SUPPORT_REQUIRED_URL);
  return { ...giveUsDetailsHearingTask, url: constructedUrl, status: taskStatus };
};
