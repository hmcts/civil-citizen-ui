import {t} from 'i18next';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {TaskList} from 'common/models/taskList/taskList';
import {getLng} from 'common/utils/languageToggleUtils';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIM_RESOLVING_DISPUTE_URL} from 'routes/urls';

export const getTaskLists = (caseData: Claim, userId: string, lang: string): TaskList[] => {
  const taskListConsiderOtherOptions: TaskList = buildConsiderOtherOptions(caseData, userId, lang);

  const taskGroups: TaskList[] = [
    taskListConsiderOtherOptions, 
  ];
  return taskGroups;
};

export const buildConsiderOtherOptions = (caseData: Claim, userId: string, lang: string): TaskList => {
  
  const considerOtherOptionsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(userId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.resolvingDispute) {
    considerOtherOptionsTask.status = TaskStatus.COMPLETE;
  }

  const taskList: TaskList = {
    title: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS'),
    tasks: [considerOtherOptionsTask]
  };

  return taskList;
};
