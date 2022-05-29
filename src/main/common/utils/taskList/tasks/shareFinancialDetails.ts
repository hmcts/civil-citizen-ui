import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {FINANCIAL_DETAILS_URL} from '../../../../routes/urls';
import {
  financialDetailsShared,
  isCounterpartyCompany,
  isIndividualWithStatementOfMeansComplete,
} from './taskListHelpers';

const shareFinancialDetailsTask: Task = {
  description: 'Share your financial details',
  url: FINANCIAL_DETAILS_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getShareFinancialDetailsTask = (caseData: Claim, claimId: string): Task => {
  let taskStatus = TaskStatus.INCOMPLETE;

  if (financialDetailsShared(caseData) && (isIndividualWithStatementOfMeansComplete(caseData) || isCounterpartyCompany(caseData.respondent1))) {
    taskStatus = TaskStatus.COMPLETE;
  }

  const constructedUrl = constructResponseUrlWithIdParams(claimId, FINANCIAL_DETAILS_URL);
  return { ...shareFinancialDetailsTask, url: constructedUrl, status: taskStatus };
};
