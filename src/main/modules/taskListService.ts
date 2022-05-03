import {TaskStatus} from '../common/models/taskList/TaskStatus';
import {TaskList} from '../common/models/taskList/taskList';
import {Claim} from '../common/models/claim';
import {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection,
  buildTryToResolveClaimSection,
  buildYourHearingRequirementsSection,
} from '../common/utils/taskList/taskListBuilder';

/**
 * THIS FILE IS A CONCEPT
 *
 * This code is only a concept of what we should do.
 *
 */

let completed = 0;
let total = 0;

const getTaskLists = async (claim: Claim) => {

  // TASK BUILDER
  const taskListPrepareYourResponse: TaskList = await buildPrepareYourResponseSection(claim);
  const taskListRespondeToClaim: TaskList = await buildRespondToClaimSection(claim);
  const taskListTryToResolveClaim: TaskList = await buildTryToResolveClaimSection(claim);
  const taskListYourHearingRequirements: TaskList = await buildYourHearingRequirementsSection(claim);

  // GENERATE DATA, TITLE AND DESCRIPTION
  let taskLists = [];
  taskLists.push(
    taskListPrepareYourResponse,
    taskListRespondeToClaim,
    taskListTryToResolveClaim,
    taskListYourHearingRequirements,
  );
  taskLists = taskLists.filter(item => item.tasks.length !== 0);
  return taskLists;
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
