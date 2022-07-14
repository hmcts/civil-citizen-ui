import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_REPAYMENT_PLAN_FULL_URL} from '../../../../routes/urls';
import {isRepaymentPlanMissing} from './taskListHelpers';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getRepaymentPlanTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const repaymentPlanTask: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.YOUR_REPAYMENT_PLAN', {lng: getLng(lang)}),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN_FULL_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (!isRepaymentPlanMissing(caseData)) {
    repaymentPlanTask.status = TaskStatus.COMPLETE;
  }

  return repaymentPlanTask;
};
