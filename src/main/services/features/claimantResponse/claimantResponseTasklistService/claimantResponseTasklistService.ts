import {Claim} from 'common/models/claim';
import {TaskList} from 'common/models/taskList/taskList';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  buildClaimantHearingRequirementsSection, buildClaimantResponseMediationSection,
  buildClaimantResponseSubmitSection,
  buildHowDefendantRespondSection,
  buildWhatToDoNextSection,
  buildYourResponseSection,
} from './claimantResponseTasklistBuilder';
import { Task } from 'common/models/taskList/task';
import { TaskStatus } from 'common/models/taskList/TaskStatus';
import {ClaimResponseStatus} from 'models/claimResponseStatus';

export function getClaimantResponseTaskLists (claim: Claim, claimId: string, lng: string, carmApplicable: boolean) {
  const lang = getLng(lng);
  const taskGroups : TaskList[] = [];
  taskGroups.push(buildHowDefendantRespondSection(claim, claimId, lang));
  if(canShowWhatToDoNextSection(claim)) {
    taskGroups.push(buildWhatToDoNextSection(claim, claimId, lang));
  }
  if(canShowYourResponseSection(claim)) {
    taskGroups.push(buildYourResponseSection(claim, claimId, lang, carmApplicable));
  }

  if (carmApplicable &&
    (claim.hasClaimantIntentToProceedResponse() || claim.hasClaimantRejectedDefendantResponse() || claim.hasClaimantRejectedDefendantPaid() || claim.hasClaimantRejectedPartAdmitPayment())) {
    taskGroups.push(buildClaimantResponseMediationSection(claim, claimId, lang, carmApplicable));
  }

  taskGroups.push(buildClaimantHearingRequirementsSection(claim, claimId, lang));
  taskGroups.push(buildClaimantResponseSubmitSection(claimId, lang));
  return taskGroups.filter(item => item.tasks.length !== 0);
}

export const outstandingClaimantResponseTasks = (caseData: Claim, claimId: string, lang: string, carmApplicable: boolean): Task[] => {
  return outstandingTasksFromTaskLists(getClaimantResponseTaskLists(caseData, claimId, lang, carmApplicable));
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

function canShowWhatToDoNextSection(claim: Claim) : boolean {
  return (
    claim.isPartialAdmissionNotPaid()
    || isFullDefenceWithDisputeOrFullPaid(claim)
    || claim.isFullAdmission()
  );
}

function canShowYourResponseSection(claim: Claim) : boolean {
  return (
    claim.isPartialAdmissionPaid()
    || isFullDefenceWithPaidLess(claim)
  );
}

function isFullDefenceWithDisputeOrFullPaid(claim: Claim) : boolean {
  return (claim.isFullDefence()
    && (claim.isRejectAllOfClaimDispute()
      || claim.responseStatus === ClaimResponseStatus.RC_PAID_FULL));
}

function isFullDefenceWithPaidLess(claim: Claim) : boolean {
  return (claim.isFullDefence()
    && !claim.isRejectAllOfClaimDispute()
    && claim.responseStatus === ClaimResponseStatus.RC_PAID_LESS);
}
