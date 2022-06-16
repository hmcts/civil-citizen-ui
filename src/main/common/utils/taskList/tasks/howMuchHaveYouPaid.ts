import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_AMOUNT_YOU_PAID_URL} from '../../../../routes/urls';
// import {isPaymentOptionMissing} from './taskListHelpers';

const howMuchHaveYouPaidTask: Task = {
  description: 'How much have you paid?',
  url: CITIZEN_AMOUNT_YOU_PAID_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getHowMuchHaveYouPaidTask = (caseData: Claim, claimId: string): Task => {
  let taskStatus = TaskStatus.INCOMPLETE;
  // if (isPaymentOptionMissing(caseData)) {
  //   taskStatus = TaskStatus.COMPLETE;
  // }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_AMOUNT_YOU_PAID_URL);
  return { ...howMuchHaveYouPaidTask, url: constructedUrl, status: taskStatus };
};
