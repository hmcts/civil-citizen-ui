import {TaskStatus} from '../../../common/models/taskList/TaskStatus';
import {TaskList} from '../../../common/models/taskList/taskList';
import {
  buildPrepareYourResponseSection,
  buildResolvingTheClaimSection,
  buildRespondToClaimSection,
  buildSubmitSection,
  buildYourHearingRequirementsSection,
} from '../../../common/utils/taskList/taskListBuilder';
import {Task} from '../../../common/models/taskList/task';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {t} from 'i18next';
import {Claim} from '../../../common/models/claim';

const getTaskLists = (caseData: Claim, currentClaimId: string, lang: string, carmApplicable = false) => {

  // TASK BUILDER
  // TODO : depending on the defendant's response type (full admission/partial admission/ rejection) we need to build new taskLists and include them in the taskGroups array
  const taskListPrepareYourResponse: TaskList = buildPrepareYourResponseSection(caseData, currentClaimId, lang, carmApplicable);
  const taskListRespondToClaim: TaskList = buildRespondToClaimSection(caseData, currentClaimId, lang);
  const taskListResolvingTheClaim: TaskList = buildResolvingTheClaimSection(caseData, currentClaimId, lang, carmApplicable);
  const taskListYourHearingRequirements: TaskList = buildYourHearingRequirementsSection(caseData, currentClaimId, lang);

  const taskGroups = [taskListPrepareYourResponse, taskListRespondToClaim, taskListResolvingTheClaim, taskListYourHearingRequirements];
  const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
  // check if all tasks are completed except check and submit
  calculateTotalAndCompleted(taskGroups);

  const taskListSubmitYourResponse: TaskList = buildSubmitSection(currentClaimId, lang);

  filteredTaskGroups.push(taskListSubmitYourResponse);
  return filteredTaskGroups;
};

const outstandingTasksFromCase = (caseData: Claim, claimId: string, lang: string): Task[] => {
  return outstandingTasksFromTaskLists(getTaskLists(caseData, claimId, lang));
};

const isOutstanding = (task: Task): boolean => {
  return task.status !== TaskStatus.COMPLETE && !task.isCheckTask;
};

const outstandingTasksFromTaskLists = (taskLists: TaskList[]): Task[] => {
  return taskLists
    .map((taskList: TaskList) => taskList.tasks)
    .flat()
    .filter(task => isOutstanding(task));
};

export const calculateTotalAndCompleted = (taskLists: TaskList[]) => {
  let completed = 0;
  let total = 0;
  taskLists.forEach(taskList => {
    total += taskList.tasks.length;
    completed += countCompletedTasks(taskList);
  });
  return {completed, total};
};

const getTitle = (taskLists: TaskList[], lang: string) => {
  const {completed, total} = calculateTotalAndCompleted(taskLists);
  return completed < total ? t('TASK_LIST.APPLICATION_INCOMPLETE', {lng: getLng(lang)}) : t('TASK_LIST.APPLICATION_COMPLETE', {lng: getLng(lang)});
};

const getDescription = (taskLists: TaskList[], lang: string) => {
  const {completed, total} = calculateTotalAndCompleted(taskLists);
  return t('TASK_LIST.COMPLETED_SECTIONS', {completed, total, lng: getLng(lang)});
};

const countCompletedTasks = (taskList: TaskList) => {
  return taskList.tasks.filter(task => task.status === TaskStatus.COMPLETE).length;
};

export {
  getDescription,
  getTaskLists,
  getTitle,
  isOutstanding,
  outstandingTasksFromCase,
  outstandingTasksFromTaskLists,
};
