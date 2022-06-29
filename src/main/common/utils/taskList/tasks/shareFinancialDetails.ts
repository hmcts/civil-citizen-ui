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
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getShareFinancialDetailsTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const shareFinancialDetailsTask: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.SHARE_YOUR_FINANCIAL_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, FINANCIAL_DETAILS_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (financialDetailsShared(caseData) && (isIndividualWithStatementOfMeansComplete(caseData) || isCounterpartyCompany(caseData.respondent1))) {
    shareFinancialDetailsTask.status = TaskStatus.COMPLETE;
  }

  return shareFinancialDetailsTask;
};
