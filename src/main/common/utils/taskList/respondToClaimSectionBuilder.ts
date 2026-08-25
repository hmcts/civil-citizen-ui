import {Claim} from 'models/claim';
import {Task} from 'models/taskList/task';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {ResponseType} from 'common/form/models/responseType';
import {YesNo} from 'common/form/models/yesNo';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {isNotPayImmediatelyResponse} from './tasks/taskListHelpers';
import {getChooseAResponseTask} from './tasks/chooseAResponse';
import {getDecideHowYouPayTask} from './tasks/decideHowYouPay';
import {getShareFinancialDetailsTask} from './tasks/shareFinancialDetails';
import {getRepaymentPlanTask} from './tasks/repaymentPlan';
import {getHowMuchHaveYouPaidTask} from './tasks/howMuchHaveYouPaid';
import {getHowMuchMoneyAdmitOweTask} from './tasks/howMuchMoneyAdmitOwe';
import {getWhenWillYouPayTask} from './tasks/whenWillYouPay';
import {getTellUsHowMuchYouHavePaidTask} from './tasks/tellUsHowMuchYouHavePaid';
import {getTellUsWhyDisagreeWithClaimTask} from './tasks/tellUsWhyDisagreeWithClaim';
import {getWhyDisagreeWithAmountClaimedTask} from './tasks/whyDisagreeWithAmountClaimed';

type RespondToClaimTasks = {
  chooseAResponseTask: Task;
  decideHowYouPayTask: Task;
  shareFinancialDetailsTask: Task;
  repaymentPlanTask: Task;
  howMuchHaveYouPaidTask: Task;
  howMuchMoneyAdmitOweTask: Task;
  whenWillYouPayTask: Task;
  tellUsHowMuchYouHavePaidTask: Task;
  tellUsWhyDisagreeWithClaimTask: Task;
};

const getRespondToClaimTasks = (caseData: Claim, claimId: string, lang: string): RespondToClaimTasks => ({
  chooseAResponseTask: getChooseAResponseTask(caseData, claimId, lang),
  decideHowYouPayTask: getDecideHowYouPayTask(caseData, claimId, lang),
  shareFinancialDetailsTask: getShareFinancialDetailsTask(caseData, claimId, lang),
  repaymentPlanTask: getRepaymentPlanTask(caseData, claimId, lang),
  howMuchHaveYouPaidTask: getHowMuchHaveYouPaidTask(caseData, claimId, lang),
  howMuchMoneyAdmitOweTask: getHowMuchMoneyAdmitOweTask(caseData, claimId, lang),
  whenWillYouPayTask: getWhenWillYouPayTask(caseData, claimId, lang),
  tellUsHowMuchYouHavePaidTask: getTellUsHowMuchYouHavePaidTask(caseData, claimId, lang),
  tellUsWhyDisagreeWithClaimTask: getTellUsWhyDisagreeWithClaimTask(caseData, claimId, lang),
});

const isRejectAllAndCounterClaim = (caseData: Claim): boolean => {
  return caseData.rejectAllOfClaim?.option === RejectAllOfClaimType.COUNTER_CLAIM;
};

const isChooseAResponseComplete = (task: Task): boolean => {
  return task.status === TaskStatus.COMPLETE;
};

const hasPartialAdmissionAlreadyPaid = (caseData: Claim): boolean => {
  return caseData.partialAdmission?.alreadyPaid?.option === YesNo.YES;
};

const hasPartialAdmissionNotPaid = (caseData: Claim): boolean => {
  return caseData.partialAdmission?.alreadyPaid?.option === YesNo.NO;
};

const hasPartialAdmissionAmountOwed = (caseData: Claim): boolean => {
  return !!caseData.partialAdmission?.howMuchDoYouOwe?.amount;
};

const isPartialAdmissionBySetDate = (caseData: Claim): boolean => {
  return caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE
    && !!caseData.partialAdmission?.paymentIntention?.paymentDate;
};

const isPartialAdmissionInstallments = (caseData: Claim): boolean => {
  return caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
};

const shouldShowFullDefenceWhyDisagreeAmount = (caseData: Claim): boolean => {
  return caseData.rejectAllOfClaim?.howMuchHaveYouPaid?.amount < caseData.totalClaimAmount;
};

const applyCounterClaimRule = (caseData: Claim, chooseAResponseTask: Task): void => {
  if (isRejectAllAndCounterClaim(caseData)) {
    chooseAResponseTask.status = TaskStatus.INCOMPLETE;
  }
};

const buildFullAdmissionTasks = (caseData: Claim, tasks: RespondToClaimTasks): Task[] => {
  const fullAdmissionTasks: Task[] = [tasks.decideHowYouPayTask];

  if (tasks.decideHowYouPayTask.status === TaskStatus.COMPLETE && isNotPayImmediatelyResponse(caseData)) {
    fullAdmissionTasks.push(tasks.shareFinancialDetailsTask);
    if (caseData.isFAPaymentOptionInstallments()) {
      fullAdmissionTasks.push(tasks.repaymentPlanTask);
    }
  }

  return fullAdmissionTasks;
};

const buildPartialAdmissionTasks = (caseData: Claim, claimId: string, lang: string, tasks: RespondToClaimTasks): Task[] => {
  const partialAdmissionTasks: Task[] = [];
  const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(caseData, claimId, ResponseType.PART_ADMISSION, lang);

  if (hasPartialAdmissionAlreadyPaid(caseData)) {
    partialAdmissionTasks.push(tasks.howMuchHaveYouPaidTask);
  } else if (hasPartialAdmissionNotPaid(caseData)) {
    partialAdmissionTasks.push(tasks.howMuchMoneyAdmitOweTask);
    if (hasPartialAdmissionAmountOwed(caseData)) {
      partialAdmissionTasks.push(tasks.whenWillYouPayTask);
    }
  }

  const shouldAddFinancialDetails = isPartialAdmissionBySetDate(caseData) || isPartialAdmissionInstallments(caseData);
  if (shouldAddFinancialDetails) {
    partialAdmissionTasks.push(tasks.shareFinancialDetailsTask);
  }

  if (isPartialAdmissionInstallments(caseData)) {
    partialAdmissionTasks.push(tasks.repaymentPlanTask);
  }

  // Insert after the first partial-admission task to match legacy ordering (not at the end).
  const DISAGREE_TASK_POSITION = 1;
  partialAdmissionTasks.splice(DISAGREE_TASK_POSITION, 0, whyDisagreeWithAmountClaimedTask);
  return partialAdmissionTasks;
};

const buildFullDefenceTasks = (caseData: Claim, claimId: string, lang: string, tasks: RespondToClaimTasks): Task[] => {
  const fullDefenceTasks: Task[] = [];

  if (caseData.hasConfirmedAlreadyPaid()) {
    fullDefenceTasks.push(tasks.tellUsHowMuchYouHavePaidTask);
    if (shouldShowFullDefenceWhyDisagreeAmount(caseData)) {
      fullDefenceTasks.push(getWhyDisagreeWithAmountClaimedTask(caseData, claimId, ResponseType.FULL_DEFENCE, lang));
    }
  } else if (caseData.isRejectAllOfClaimDispute()) {
    fullDefenceTasks.push(tasks.tellUsWhyDisagreeWithClaimTask);
  }

  return fullDefenceTasks;
};

export const buildRespondToClaimTasks = (caseData: Claim, claimId: string, lang: string): Task[] => {
  const tasks = getRespondToClaimTasks(caseData, claimId, lang);
  applyCounterClaimRule(caseData, tasks.chooseAResponseTask);

  const sectionTasks: Task[] = [tasks.chooseAResponseTask];
  if (!isChooseAResponseComplete(tasks.chooseAResponseTask)) {
    return sectionTasks;
  }

  if (caseData.isFullAdmission()) {
    sectionTasks.push(...buildFullAdmissionTasks(caseData, tasks));
  }

  if (caseData.isPartialAdmission()) {
    sectionTasks.push(...buildPartialAdmissionTasks(caseData, claimId, lang, tasks));
  }

  if (caseData.isFullDefence()) {
    sectionTasks.push(...buildFullDefenceTasks(caseData, claimId, lang, tasks));
  }

  return sectionTasks;
};

export {
  isRejectAllAndCounterClaim,
};
