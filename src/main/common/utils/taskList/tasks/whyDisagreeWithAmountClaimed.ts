import { Task } from '../../../models/taskList/task';
import { Claim } from '../../../models/claim';
import { TaskStatus } from '../../../models/taskList/TaskStatus';
import { constructResponseUrlWithIdParams } from '../../../../common/utils/urlFormatter';
import { CITIZEN_WHY_DO_YOU_DISAGREE_URL } from '../../../../routes/urls';

const whyDisagreeWithAmountClaimed: Task = {
  description: 'Why do you disagree with the amount claimed?',
  url: CITIZEN_WHY_DO_YOU_DISAGREE_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getWhyDisagreeWithAmountClaimedTask = (caseData: Claim, claimId: string): Task => {
  let taskStatus = TaskStatus.INCOMPLETE;
  if (caseData.partialAdmission?.whyDoYouDisagree?.text) {
    taskStatus = TaskStatus.COMPLETE;
  }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_URL);
  return { ...whyDisagreeWithAmountClaimed, url: constructedUrl, status: taskStatus };
};
