import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_AMOUNT_YOU_PAID_URL} from '../../../../routes/urls';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getHowMuchHaveYouPaidTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const howMuchHaveYouPaidTask: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.HOW_MUCH_HAVE_YOU_PAID', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_AMOUNT_YOU_PAID_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.partialAdmission?.howMuchHaveYouPaid?.amount && caseData.partialAdmission?.howMuchHaveYouPaid?.date && caseData.partialAdmission?.howMuchHaveYouPaid?.text) {
    howMuchHaveYouPaidTask.status = TaskStatus.COMPLETE;
  }
  
  return howMuchHaveYouPaidTask;
};
