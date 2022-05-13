import {TaskStatus} from '../common/models/taskList/TaskStatus';
import {TaskList} from '../common/models/taskList/taskList';
import {Claim} from '../common/models/claim';
import {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection, buildSubmitSection,
} from '../common/utils/taskList/taskListBuilder';

let completed = 0;
let total = 0;

const getTaskLists = (claim: Claim, caseData: Claim, currentClaimId:string) => {

  // TASK BUILDER
  // TODO : depending on the defendant's response type (full admission/partial admission/ rejection) we need to build new taskLists and include them in the taskGroups array
  const taskListPrepareYourResponse: TaskList = buildPrepareYourResponseSection(claim, caseData, currentClaimId);
  const taskListRespondeToClaim: TaskList = buildRespondToClaimSection(caseData, currentClaimId);

  const taskGroups = [taskListPrepareYourResponse, taskListRespondeToClaim];
  const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
  // check if all tasks are completed except check and submit
  let isInCompletsubmission = true;
  calculateTotalAndCompleted(taskGroups);
  if (completed === total) {
    isInCompletsubmission = false;
  }

  const taskListSubmitYourResponse: TaskList = buildSubmitSection(claim, caseData, currentClaimId, isInCompletsubmission);
  
  filteredTaskGroups.push(taskListSubmitYourResponse);
  return filteredTaskGroups;
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

export { getTaskLists, getTitle, getDescription };
  
