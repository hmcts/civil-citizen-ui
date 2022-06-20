import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_OWED_AMOUNT_URL} from '../../../../routes/urls';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getHowMuchMoneyAdmitOweTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const howMuchMoneyAdmitOweTask: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.HOW_MUCH_MONEY_ADMIT_OWE', { lng: getLng(lang) }),
    url: CITIZEN_OWED_AMOUNT_URL,
    status: TaskStatus.INCOMPLETE,
  };
  let taskStatus = TaskStatus.INCOMPLETE;
  if (caseData.partialAdmission?.howMuchDoYouOwe?.amount) {
    taskStatus = TaskStatus.COMPLETE;
  }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_OWED_AMOUNT_URL);
  return { ...howMuchMoneyAdmitOweTask, url: constructedUrl, status: taskStatus };
};
