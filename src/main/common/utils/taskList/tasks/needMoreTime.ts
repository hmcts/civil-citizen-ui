import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';

const needMoreTimeTask = {
  description: t('TASK_LIST.RESPOND_TO_CLAIM.VIEW_OPTIONS'),
  url: '/more-time-request',
  status: TaskStatus.INCOMPLETE,
};

export const getNeedMoreTimeTask = (claim: Claim, language: string): Task => {
  needMoreTimeTask.description = t('TASK_LIST.RESPOND_TO_CLAIM.VIEW_OPTIONS', { lng: getLng(language) });
  /**
  * TODO: add logic to mark task as complete if
  *  - within response deadline
  *  - and either CIV-916 completed
  *  - or CIV-915 - no selection
  *  - or CIV-915 - my request has been refused selection
  **/
  return needMoreTimeTask;
};

