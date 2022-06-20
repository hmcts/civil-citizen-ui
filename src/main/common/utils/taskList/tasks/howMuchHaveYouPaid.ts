import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_AMOUNT_YOU_PAID_URL} from '../../../../routes/urls';

const howMuchHaveYouPaidTask: Task = {
  description: 'How much have you paid?',
  url: CITIZEN_AMOUNT_YOU_PAID_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getHowMuchHaveYouPaidTask = (caseData: Claim, claimId: string): Task => {
  let taskStatus = TaskStatus.INCOMPLETE;
  if (caseData.partialAdmission?.howMuchHaveYouPaid?.amount && caseData.partialAdmission?.howMuchHaveYouPaid?.date && caseData.partialAdmission?.howMuchHaveYouPaid?.text) {
    taskStatus = TaskStatus.COMPLETE;
  }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_AMOUNT_YOU_PAID_URL);
  return { ...howMuchHaveYouPaidTask, url: constructedUrl, status: taskStatus };
};
