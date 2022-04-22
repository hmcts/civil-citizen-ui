import {TaskStatus} from "../../common/form/models/TaskStatus";
import {Task} from "../../common/form/models/task";
import {TaskList} from "../../common/form/models/taskList";
import {Claim} from "../../common/models/claim";
import {getConfirmYourDetailsTask} from "./tasks/confirmYourDetails";
import {getneedMoreTimeTask} from "./tasks/needMoreTime";

/**
 * THIS FILE IS A CONCEPT AND DOESN'T WORK
 * 
 * The logic on this file is not the real business logic.
 * This code is only a concept of what we should do. 
 * 
 */

const choseAResponseTask = {
  description: "Choose a response",
  url: "/chose-a-response",
  status: TaskStatus.COMPLETE
};

const howMuchYouHavePaidTask = {
  description: "Tell us how much you’ve paid",
  url: "/how-much-paid",
  status: TaskStatus.INCOMPLETE
};

const buildPrepareYourResponseSection = async (claim: Claim): Promise<TaskList> => {
  let tasks: Task[] = [];
  const confirmYourDetailsTask = getConfirmYourDetailsTask(claim);
  const needMoreTimeTask = getneedMoreTimeTask(claim);

  tasks.push(confirmYourDetailsTask);
  if (claim.respondent1ResponseDeadline > new Date()) {
    tasks.push(needMoreTimeTask);
  }
  return { title: 'Prepare your response', tasks };
}

const buildRespondeToClaimSection = async (claim: Claim): Promise<TaskList> => {
  let tasks: Task[] = [];

  tasks.push(choseAResponseTask);
  if (!claim.paymentOption) {
    tasks.push(howMuchYouHavePaidTask);
  }
  return { title: 'Responde to Claim', tasks };
}

const buildTryToResolveClaimSection = async (claim: Claim): Promise<TaskList> => {
  let tasks: Task[] = [];

  if (!claim.paymentOption) {
    tasks.push(howMuchYouHavePaidTask);
  }
  return { title: 'Try to resolve the Claim', tasks };
}

const buildYourHearingRequirementsSection = async (claim: Claim): Promise<TaskList> => {
  let tasks: Task[] = [];

  if (claim.paymentOption) {
    tasks.push(howMuchYouHavePaidTask);
  }
  return { title: 'Your hearing requirements', tasks };
}

export {
  buildPrepareYourResponseSection,
  buildRespondeToClaimSection,
  buildTryToResolveClaimSection,
  buildYourHearingRequirementsSection,
}
