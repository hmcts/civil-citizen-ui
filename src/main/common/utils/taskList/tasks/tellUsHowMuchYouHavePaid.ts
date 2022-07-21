import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_FR_AMOUNT_YOU_PAID_URL} from '../../../../routes/urls';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getTellUsHowMuchYouHavePaidTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const tellUsHowMuchYouHavePaidTask: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.TELL_US_HOW_MUCH_YOU_HAVE_PAID', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_FR_AMOUNT_YOU_PAID_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.rejectAllOfClaim?.howMuchHaveYouPaid?.amount) {
    tellUsHowMuchYouHavePaidTask.status = TaskStatus.COMPLETE;
  }

  return tellUsHowMuchYouHavePaidTask;
};
