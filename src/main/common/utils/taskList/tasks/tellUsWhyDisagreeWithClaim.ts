import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {RESPONSE_YOUR_DEFENCE_URL} from '../../../../routes/urls';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getTellUsWhyDisagreeWithClaimTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const tellUsWhyDisagreeWithClaimTask: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.TELL_US_WHY_DISAGREE_WITH_CLAIM', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, RESPONSE_YOUR_DEFENCE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.defence?.text) {
    tellUsWhyDisagreeWithClaimTask.status = TaskStatus.COMPLETE;
  }

  return tellUsWhyDisagreeWithClaimTask;
};
