import {Task} from 'models/taskList/task';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from '../../urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';

/**
 *
 * this file needs to be revisited when check and submit page is developed.
 *
 */

export const getCheckAndSubmitYourResponseTask = (claimId: string, lang: string, isAvailable: boolean): Task => {
  return {
    description: t('TASK_LIST.SUBMIT.CHECK_AND_SUBMIT', { lng: getLng(lang) }),
    url: isAvailable ? constructResponseUrlWithIdParams(claimId, RESPONSE_CHECK_ANSWERS_URL) : '',
    status: isAvailable ? TaskStatus.INCOMPLETE : TaskStatus.NOT_AVAILABLE_YET,
    isCheckTask: true,
  };
};