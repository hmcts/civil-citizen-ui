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

/**
 * Type definition for all possible tasks in the Respond to Claim section.
 * All tasks are always created but may be conditionally added to the final task list
 * based on the claim's response type and other business rules.
 */
type RespondToClaimTasks = {
  /** Always shown first - user selects response type (full/partial admission or full defence) */
  chooseAResponseTask: Task;
  /** Shown for full admission - user chooses payment method */
  decideHowYouPayTask: Task;
  /** Shown when payment is not immediate - user provides financial details */
  shareFinancialDetailsTask: Task;
  /** Shown when payment is by installments - user defines repayment schedule */
  repaymentPlanTask: Task;
  /** Shown for partial admission when user already paid - user states amount paid */
  howMuchHaveYouPaidTask: Task;
  /** Shown for partial admission when not paid - user states amount they admit owing */
  howMuchMoneyAdmitOweTask: Task;
  /** Shown for partial admission - user states when they will pay */
  whenWillYouPayTask: Task;
  /** Shown for full defence when already paid - user states amount paid */
  tellUsHowMuchYouHavePaidTask: Task;
  /** Shown for full defence dispute - user explains why they disagree */
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

/**
 * Checks if the user selected reject all with counter claim option.
 * @param caseData - The claim data
 * @returns true if reject all with counter claim is selected
 */
const isRejectAllAndCounterClaim = (caseData: Claim): boolean => {
  return caseData.rejectAllOfClaim?.option === RejectAllOfClaimType.COUNTER_CLAIM;
};

/**
 * Checks if the "Choose a Response" task has been completed.
 * @param task - The task to check
 * @returns true if task status is COMPLETE
 */
const isChooseAResponseComplete = (task: Task): boolean => {
  return task.status === TaskStatus.COMPLETE;
};

/**
 * Checks if the user indicated they already paid in partial admission flow.
 * @param caseData - The claim data
 * @returns true if alreadyPaid option is YES
 */
const hasPartialAdmissionAlreadyPaid = (caseData: Claim): boolean => {
  return caseData.partialAdmission?.alreadyPaid?.option === YesNo.YES;
};

/**
 * Checks if the user indicated they have not paid in partial admission flow.
 * @param caseData - The claim data
 * @returns true if alreadyPaid option is NO
 */
const hasPartialAdmissionNotPaid = (caseData: Claim): boolean => {
  return caseData.partialAdmission?.alreadyPaid?.option === YesNo.NO;
};

/**
 * Checks if the user has specified an amount they admit owing.
 * @param caseData - The claim data
 * @returns true if howMuchDoYouOwe amount is set
 */
const hasPartialAdmissionAmountOwed = (caseData: Claim): boolean => {
  return !!caseData.partialAdmission?.howMuchDoYouOwe?.amount;
};

/**
 * Checks if payment option is by set date with a date specified.
 * @param caseData - The claim data
 * @returns true if payment option is BY_SET_DATE and payment date is set
 */
const isPartialAdmissionBySetDate = (caseData: Claim): boolean => {
  return caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE
    && !!caseData.partialAdmission?.paymentIntention?.paymentDate;
};

/**
 * Checks if payment option is by installments.
 * @param caseData - The claim data
 * @returns true if payment option is INSTALMENTS
 */
const isPartialAdmissionInstallments = (caseData: Claim): boolean => {
  return caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
};

/**
 * Checks if the amount paid is less than total claim amount in full defence.
 * Used to determine if "why disagree with amount" task should be shown.
 * @param caseData - The claim data
 * @returns true if paid amount is less than total claim amount
 */
const shouldShowFullDefenceWhyDisagreeAmount = (caseData: Claim): boolean => {
  return caseData.rejectAllOfClaim?.howMuchHaveYouPaid?.amount < caseData.totalClaimAmount;
};

/**
 * Applies business rule for counter claim scenarios.
 * If user selects reject all with counter claim, marks the choose response task as incomplete.
 * @param caseData - The claim data
 * @param chooseAResponseTask - The task to potentially modify
 */
const applyCounterClaimRule = (caseData: Claim, chooseAResponseTask: Task): void => {
  if (isRejectAllAndCounterClaim(caseData)) {
    chooseAResponseTask.status = TaskStatus.INCOMPLETE;
  }
};

/**
 * Builds the task list for full admission response type.
 * @param caseData - The claim data
 * @param tasks - All available tasks
 * @returns Array of tasks to display for full admission
 */
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

/**
 * Builds the task list for partial admission response type.
 * @param caseData - The claim data
 * @param claimId - The claim ID
 * @param lang - The language code
 * @param tasks - All available tasks
 * @returns Array of tasks to display for partial admission
 */
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

  // Add financial details task if payment is by set date or installments
  const shouldAddFinancialDetails = isPartialAdmissionBySetDate(caseData) || isPartialAdmissionInstallments(caseData);
  if (shouldAddFinancialDetails) {
    partialAdmissionTasks.push(tasks.shareFinancialDetailsTask);
  }

  // Add repayment plan task if payment is by installments
  if (isPartialAdmissionInstallments(caseData)) {
    partialAdmissionTasks.push(tasks.repaymentPlanTask);
  }

  // Insert whyDisagree task at position 1 (after first task, before remaining tasks)
  // to maintain original task ordering from legacy implementation
  const DISAGREE_TASK_POSITION = 1;
  partialAdmissionTasks.splice(DISAGREE_TASK_POSITION, 0, whyDisagreeWithAmountClaimedTask);
  return partialAdmissionTasks;
};

/**
 * Builds the task list for full defence response type.
 * @param caseData - The claim data
 * @param claimId - The claim ID
 * @param lang - The language code
 * @param tasks - All available tasks
 * @returns Array of tasks to display for full defence
 */
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

/**
 * Main builder function that constructs the complete "Respond to Claim" task list.
 * Orchestrates task creation based on response type and applies business rules.
 * @param caseData - The claim data
 * @param claimId - The claim ID
 * @param lang - The language code
 * @returns Array of tasks to display in the respond to claim section
 */
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
