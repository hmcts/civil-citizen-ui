import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_OWED_AMOUNT_URL} from '../../../../routes/urls';
// import {isPaymentOptionMissing} from './taskListHelpers';

const howMuchMoneyAdmitOweTask: Task = {
  description: 'How much money do you admit you owe',
  url: CITIZEN_OWED_AMOUNT_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getHowMuchMoneyAdmitOweTask = (caseData: Claim, claimId: string): Task => {
  let taskStatus = TaskStatus.INCOMPLETE;
  // if (isPaymentOptionMissing(caseData)) {
  //   taskStatus = TaskStatus.COMPLETE;
  // }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_OWED_AMOUNT_URL);
  return { ...howMuchMoneyAdmitOweTask, url: constructedUrl, status: taskStatus };
};
