import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_WHY_DO_YOU_DISAGREE_URL} from '../../../../routes/urls';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getWhyDisagreeWithAmountClaimedTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const whyDisagreeWithAmountClaimed: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.WHY_DO_YOU_DISAGREE', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_URL),
    status: TaskStatus.INCOMPLETE,
  };
  if (caseData.partialAdmission?.whyDoYouDisagree?.text) {
    whyDisagreeWithAmountClaimed.status = TaskStatus.COMPLETE;
  }
  return whyDisagreeWithAmountClaimed;
};
