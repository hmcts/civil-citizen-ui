import dayjs from 'dayjs';
import {Task} from '../../models/taskList/task';
import {TaskList} from '../../models/taskList/taskList';
import {Claim} from '../../models/claim';
import {TaskStatus} from '../../models/taskList/TaskStatus';
import {getConfirmYourDetailsTask} from './tasks/confirmYourDetails';
import {getneedMoreTimeTask} from './tasks/needMoreTime';
import {getChooseAResponseTask} from './tasks/chooseAResponse';
import {getCheckAndSubmitYourResponseTask} from './tasks/checkAndSubmitYourResponse';
import {isPastDeadline,currentDateTime} from '../dateUtils';

const buildPrepareYourResponseSection = (claim: Claim, caseData: Claim, claimId:string): TaskList => {
  const tasks: Task[] = [];
  const now = currentDateTime();
  const confirmYourDetailsTask = getConfirmYourDetailsTask(caseData, claimId);
  // TODO : when need more time page is developed we need to generate this function and push this task to the tasks
  const needMoreTimeTask = getneedMoreTimeTask(claim);

  const isDeadlinePassed = isPastDeadline(now, dayjs(caseData.respondent1ResponseDeadline));
  // TODO : we also need to check if the posponed deadline is passed if the defendant requested addtional time when the page is developed 
  // isDeadlinePassed = isPastDeadline(now, postponedDeadline);
  
  tasks.push(confirmYourDetailsTask);
  if (!isDeadlinePassed) {
    tasks.push(needMoreTimeTask);
  }
  return { title: 'Prepare your response', tasks };
};

const buildRespondToClaimSection = (caseData: Claim, claimId: string): TaskList => {
  const tasks: Task[] = [];
  const chooseAResponseTask = getChooseAResponseTask(caseData, claimId);
  // TODO : depending on the response type full admission/partial admission or rejection we need to add new tasks

  tasks.push(chooseAResponseTask);
  return { title: 'Respond to Claim', tasks };
};

const buildSubmitSection = (claim: Claim, caseData:Claim, claimId:string): TaskList => {
  const tasks: Task[] = [];

  // check if all tasks are completed except check and submit
  let isInCompletsubmission = true;
  const taskListPrepareYourResponse: TaskList = buildPrepareYourResponseSection(claim, caseData, claimId);
  const taskListRespondeToClaim: TaskList = buildRespondToClaimSection(caseData, claimId);
  const taskGroups = [taskListPrepareYourResponse, taskListRespondeToClaim];
  const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
  const allTasksExceptSubmit = filteredTaskGroups.map((taskGroup => taskGroup.tasks)).flat().map(task => task.status);
  const allTasksExceptSubmitCompleted = allTasksExceptSubmit.every(task => task === TaskStatus.COMPLETE);
  if (allTasksExceptSubmitCompleted) {
    isInCompletsubmission = false;
  }

  // TODO: when check and submit tasks page is developed we need to update logic of this task 
  const checkAndSubmitYourResponseTask = getCheckAndSubmitYourResponseTask(claim, caseData, claimId, isInCompletsubmission);

  tasks.push(checkAndSubmitYourResponseTask);
  return { title: 'Submit', tasks };
};

export {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection,
  buildSubmitSection,
};
