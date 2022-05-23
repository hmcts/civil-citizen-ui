import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {FINANCIAL_DETAILS_URL} from '../../../../routes/urls';
import {isStatementOfMeansComplete} from './taskListHelpers';

const shareFinancialDetailsTask: Task = {
  description: 'Share your financial details',
  url: FINANCIAL_DETAILS_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getShareFinancialDetailsTask = (caseData: Claim, claimId: string): Task => {
  let taskStatus = TaskStatus.INCOMPLETE;

  if (caseData?.taskSharedFinancialDetails === 'yes' && isStatementOfMeansComplete(caseData)) {
    taskStatus = TaskStatus.COMPLETE;
  }

  const constructedUrl = constructResponseUrlWithIdParams(claimId, FINANCIAL_DETAILS_URL);
  return { ...shareFinancialDetailsTask, url: constructedUrl, status: taskStatus };
};
