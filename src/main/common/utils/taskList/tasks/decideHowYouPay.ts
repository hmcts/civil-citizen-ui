import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_PAYMENT_OPTION_URL} from '../../../../routes/urls';
import {isPaymentOptionMissing} from './taskListHelpers';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getDecideHowYouPayTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const decideHowYouPayTask: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.DECIDE_HOW_YOU_WILL_PAYS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL),
    status: TaskStatus.COMPLETE,
  };
  if (isPaymentOptionMissing(caseData)) {
    decideHowYouPayTask.status = TaskStatus.INCOMPLETE;
  }
  return decideHowYouPayTask;
};
