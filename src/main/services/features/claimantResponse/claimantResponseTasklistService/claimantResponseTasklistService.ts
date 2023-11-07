import {Claim} from 'common/models/claim';
import {TaskList} from 'common/models/taskList/taskList';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  buildClaimantHearingRequirementsSection,
  buildClaimantResponseSubmitSection,
  buildHowDefendantRespondSection,
  buildWhatToDoNextSection,
  buildYourResponseSection,
} from './claimantResponseTasklistBuilder';
import { Task } from 'common/models/taskList/task';
import { TaskStatus } from 'common/models/taskList/TaskStatus';

export function getClaimantResponseTaskLists (claim: Claim, claimId: string, lng: string) {
  const lang = getLng(lng);
  const taskGroups : TaskList[] = [];
  taskGroups.push(buildHowDefendantRespondSection(claim, claimId, lang));
  if(claim.isPartialAdmissionNotPaid() || (claim.isFullDefence() && claim.isRejectAllOfClaimDispute()) || claim.isFullAdmission()) {
    taskGroups.push(buildWhatToDoNextSection(claim, claimId, lang));
  }
  if(claim.isPartialAdmissionPaid() || (claim.isFullDefence() && !claim.isRejectAllOfClaimDispute()))
  {
    taskGroups.push(buildYourResponseSection(claim, claimId, lang));
  }
  taskGroups.push(buildClaimantHearingRequirementsSection(claim, claimId, lang));
  taskGroups.push(buildClaimantResponseSubmitSection(claimId, lang));
  return taskGroups.filter(item => item.tasks.length !== 0);
}

export const outstandingClaimantResponseTasks = (caseData: Claim, claimId: string, lang: string): Task[] => {
  return outstandingTasksFromTaskLists(getClaimantResponseTaskLists(caseData, claimId, lang));
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