import {TaskStatus} from '../../../common/models/taskList/TaskStatus';
import {TaskList} from '../../../common/models/taskList/taskList';
import {Claim} from '../../../common/models/claim';
import {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection,
  buildSubmitSection,
  buildYourHearingRequirementsSection,
  buildResolvingTheClaimSection,
} from '../../../common/utils/taskList/taskListBuilder';
import {Task} from '../../../common/models/taskList/task';

let completed = 0;
let total = 0;

const getTaskLists = (claim: Claim, caseData: Claim, currentClaimId: string, lang: string) => {

  // TASK BUILDER
  // TODO : depending on the defendant's response type (full admission/partial admission/ rejection) we need to build new taskLists and include them in the taskGroups array
  const taskListPrepareYourResponse: TaskList = buildPrepareYourResponseSection(claim, caseData, currentClaimId, lang);
  const taskListRespondToClaim: TaskList = buildRespondToClaimSection(caseData, currentClaimId, lang);
  const taskListResolvingTheClaim: TaskList = buildResolvingTheClaimSection(caseData, currentClaimId, lang);
  const taskListYourHearingRequirements: TaskList = buildYourHearingRequirementsSection(caseData, currentClaimId, lang);

  const taskGroups = [taskListPrepareYourResponse, taskListRespondToClaim, taskListResolvingTheClaim, taskListYourHearingRequirements];
  const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
  // check if all tasks are completed except check and submit
  calculateTotalAndCompleted(taskGroups);

  const taskListSubmitYourResponse: TaskList = buildSubmitSection(currentClaimId, lang);

  filteredTaskGroups.push(taskListSubmitYourResponse);
  return filteredTaskGroups;
};

const outstandingTasksFromCase = (claim: Claim, claimId: string, lang: string): Task[] => {
  return outstandingTasksFromTaskLists(getTaskLists(claim, claim, claimId, lang));
};

const isOutstanding = (task: Task): boolean => {
  return task.status !== TaskStatus.COMPLETE && !task.isCheckTask ;
};

const outstandingTasksFromTaskLists = (taskLists: TaskList[]): Task[] => {
  return taskLists
    .map((taskList: TaskList) => taskList.tasks)
    .flat()
    .filter(task => isOutstanding(task));
};

const calculateTotalAndCompleted = (taskLists: TaskList[]) => {
  completed = 0;
  total = 0;
  taskLists.forEach(taskList => {
    total += taskList.tasks.length;
    completed += countCompletedTasks(taskList);
  });
};

const getTitle = (taskLists: TaskList[]) => {
  calculateTotalAndCompleted(taskLists);
  return completed < total ? 'Application incomplete' : 'Application complete';
};

const getDescription = (taskLists: TaskList[]) => {
  calculateTotalAndCompleted(taskLists);
  return `You have completed ${completed} of ${total} sections`;
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

