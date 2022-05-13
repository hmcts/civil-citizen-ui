import { Task } from '../../../models/taskList/task';
import { Claim } from '../../../models/claim';
import { TaskStatus } from '../../../models/taskList/TaskStatus';
import { constructResponseUrlWithIdParams } from '../../../../common/utils/urlFormatter';
import { CITIZEN_RESPONSE_TYPE_URL } from '../../../../routes/urls';

const chooseAResponseTask = {
  description: 'Choose a response',
  url: CITIZEN_RESPONSE_TYPE_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getChooseAResponseTask = (caseData: Claim, claimId: string): Task => {
  let isTaskCompleted = TaskStatus.COMPLETE;
  if (!caseData) {
    isTaskCompleted = TaskStatus.INCOMPLETE;
  }
  if (!caseData?.respondent1?.responseType) {
    isTaskCompleted = TaskStatus.INCOMPLETE;
  }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  return { ...chooseAResponseTask, url: constructedUrl, status: isTaskCompleted };
};