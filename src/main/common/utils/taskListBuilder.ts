import { getDraftClaimFromStore } from "../../modules/draft-store/draftStoreService";
import { TaskStatus } from "../../common/form/models/TaskStatus";
import { Task } from "../../common/form/models/task";
import { TaskList } from "../../common/form/models/taskList";
import { Claim } from "../../common/models/claim";

/**
 * THIS FILE IS A CONCEPT AND DOESN'T WORK
 * 
 * The logic on this file is not the real bussines logic.
 * This code is only a concept of what we should do. 
 * 
 */

import { getConfirmYourDetailsTask } from "./tasks/confirmYourDetails";
import { getneedMoreTimeTask } from "./tasks/needMoreTime";

/**
Section 1:  'Prepare your response'
  - Confirm your details
  - Decide if you need more time to respond

Section 2:  'Responde to Claim'
  - Chose a response
  - How much money do you admit you owe?
  - Why do you disagree with the amount claimed?
  - When will you pay the ₤100?                       !!!!!!!!!!!!!!!! IMPORTANT 100 is dynamic
  - Tell us how much you've paid
  - Share your financial details
  - Your repayment plan
  - How much have you paid?
  
Section 3:  'Try to resolve the Claim'
  - Free telephone mediation
  
Section 4:  'Your hearing requirements'
  - Give us details in case there's a hearing

Section 5:  'Submit'
 
*/

const choseAResponseTask = {
  description: "Choose a response",
  url: "/chose-a-response",
  status: TaskStatus.INCOMPLETE
};

const howMuchYouHavePaidTask = {
  description: "Tell us how much you’ve paid",
  url: "/how-much-paid",
  status: TaskStatus.INCOMPLETE
};

const checkAndSubmitTask = {
  description: "Check and submit your response",
  url: "/submit-response",
  status: TaskStatus.INCOMPLETE
};

const buildPrepareYourResponseSection = async (claimId: string): Promise<TaskList> => {
  let tasks: Task[] = [];
  const claim: Claim = await getDraftClaimFromStore(claimId);
  const confirmYourDetailsTask = await getConfirmYourDetailsTask(claimId);
  const needMoreTimeTask = await getneedMoreTimeTask(claimId);

  tasks.push(confirmYourDetailsTask);
  if (claim.respondent1ResponseDeadline > new Date()) {
    tasks.push(needMoreTimeTask);
  }
  return { title: 'Prepare your response', tasks };
}

const buildRespondeToClaimSection = async (claimId: string): Promise<TaskList> => {
  let tasks: Task[] = [];
  const claim: Claim = await getDraftClaimFromStore(claimId);

  tasks.push(choseAResponseTask);
  if (!claim.paymentOption) {
    tasks.push(howMuchYouHavePaidTask);
  }
  return { title: 'Responde to Claim', tasks };
}

const buildTryToResolveClaimSection = async (claimId: string): Promise<TaskList> => {
  let tasks: Task[] = [];
  const claim: Claim = await getDraftClaimFromStore(claimId);

  if (!claim.paymentOption) {
    tasks.push(howMuchYouHavePaidTask);
  }
  return { title: 'Try to resolve the Claim', tasks };
}

const buildYourHearingRequirementsSection = async (claimId: string): Promise<TaskList> => {
  let tasks: Task[] = [];
  const claim: Claim = await getDraftClaimFromStore(claimId);

  if (claim.paymentOption) {
    tasks.push(howMuchYouHavePaidTask);
  }
  return { title: 'Your hearing requirements', tasks };
}

const buildSubmitSection = (): TaskList => {
  let tasks: Task[] = [];
  tasks.push(checkAndSubmitTask);
  return { title: 'Submit', tasks };
}

export {
  buildPrepareYourResponseSection,
  buildRespondeToClaimSection,
  buildTryToResolveClaimSection,
  buildYourHearingRequirementsSection,
  buildSubmitSection
}