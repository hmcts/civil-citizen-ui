import {TaskStatus} from "../common/models/taskList/TaskStatus";
import {TaskList} from "../common/models/taskList/taskList";
import {Claim} from "../common/models/claim";
import {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection, buildSubmitSection,
  // buildTryToResolveClaimSection,
  // buildYourHearingRequirementsSection
} from "../common/utils/taskList/taskListBuilder";
// import dayjs, {Dayjs} from 'dayjs';
import { currentDateTime } from '../common/utils/dayJsFactory';

/**
 * THIS FILE IS A CONCEPT
 * 
 * This code is only a concept of what we should do. 
 * 
 */

let completed = 0;
let total = 0;

const getTaskLists = (claim: Claim, caseData: Claim) => {
  const now = currentDateTime();

  // TASK BUILDER
  const taskListPrepareYourResponse: TaskList = buildPrepareYourResponseSection(claim, caseData, now);
  const taskListRespondeToClaim: TaskList = buildRespondToClaimSection(claim);
  const taskListSubmitYourResponse: TaskList = buildSubmitSection(claim);
  // const taskListTryToResolveClaim: TaskList = await buildTryToResolveClaimSection(claim);
  // const taskListYourHearingRequirements: TaskList = await buildYourHearingRequirementsSection(claim);

  // GENERATE DATA, TITLE AND DESCRIPTION
  const xxx = [taskListPrepareYourResponse,
    taskListRespondeToClaim, taskListSubmitYourResponse,
    // taskListTryToResolveClaim,
    // taskListYourHearingRequirements
  ];
  return xxx.filter(item => item.tasks.length !== 0);
};

const calculateTotalAndCompleted = (taskLists: TaskList[]) => {
  completed = 0;
  total = 0;
  taskLists.forEach(taskList => {
    total += taskList.tasks.length;
    completed += countCompletedTasks(taskList);
  });
}

const getTitle = (taskLists: TaskList[]) => {
  calculateTotalAndCompleted(taskLists);
  return completed < total ? 'Application incomplete' : 'Application complete';
}

const getDescription = (taskLists: TaskList[]) => {
  calculateTotalAndCompleted(taskLists);
  return `You have completed ${completed} of ${total} sections`;
}

const countCompletedTasks = (taskList: TaskList) => {
  return taskList.tasks.filter(task => task.status === TaskStatus.COMPLETE).length;
}

export { getTaskLists, getTitle, getDescription };
