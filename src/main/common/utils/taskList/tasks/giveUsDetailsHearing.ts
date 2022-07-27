import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {SUPPORT_REQUIRED_URL} from '../../../../routes/urls';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getGiveUsDetailsHearingTask = (_caseData: Claim, claimId: string, lang: string): Task => {
  const giveUsDetailsHearingTask: Task = {
    description: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS', {lng: getLng(lang)}),
    url: constructResponseUrlWithIdParams(claimId, SUPPORT_REQUIRED_URL),
    status: TaskStatus.COMPLETE,
  };

  // TODO: add task complete logic
  return giveUsDetailsHearingTask;
};
