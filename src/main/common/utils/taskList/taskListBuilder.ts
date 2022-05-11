import {TaskStatus} from '../../models/taskList/TaskStatus';
import {Task} from '../../models/taskList/task';
import {TaskList} from '../../models/taskList/taskList';
import {Claim} from '../../models/claim';
import {getConfirmYourDetailsTask} from './tasks/confirmYourDetails';
import { getneedMoreTimeTask } from './tasks/needMoreTime';
import { isPastDeadline } from '../dayJsFactory';
import dayjs, { Dayjs } from 'dayjs';

/**
 * THIS FILE IS A CONCEPT AND DOESN'T WORK
 *
 * The logic on this file is not the real business logic.
 * This code is only a concept of what we should do.
 *
 */

const chooseAResponseTask = {
  description: 'Choose a response',
  url: '/chose-a-response',
  status: TaskStatus.INCOMPLETE,
};

// const howMuchYouHavePaidTask = {
//   description: 'Tell us how much you’ve paid',
//   url: '/how-much-paid',
//   status: TaskStatus.INCOMPLETE,
// };

const checkAndSubmitYourResponseTask = {
  description: 'Check and submit your response',
  url: '/check-and-send',
  status: TaskStatus.INCOMPLETE,
};

// const freeTelephoneMediation =  {
//   description: 'Free telephone mediation',
//   url: './mediation/free-telephone-mediation',
//   status: TaskStatus.INCOMPLETE,
// };

const buildPrepareYourResponseSection = (claim: Claim, caseData: Claim, now:Dayjs): TaskList => {
  const tasks: Task[] = [];
  const confirmYourDetailsTask = getConfirmYourDetailsTask(claim);
  const needMoreTimeTask = getneedMoreTimeTask(claim);

  let isDeadlinePassed = false;
  const normal = true;
  // if (await featureToggles.isOCONEnhancementEnabled()) {
  if (normal) {
    isDeadlinePassed = isPastDeadline(now, dayjs(caseData.respondent1ResponseDeadline));
  } else {
    // const postponedDeadline = await DeadlineCalculatorClient.calculatePostponedDeadline(claim.issuedOn)
    const postponedDeadline = dayjs('10 March 2022');
    isDeadlinePassed = isPastDeadline(now, postponedDeadline );
  }
  console.log('passed--', isDeadlinePassed)

  tasks.push(confirmYourDetailsTask);
  if (!isDeadlinePassed) {
    tasks.push(needMoreTimeTask);
  }
  return { title: 'Prepare your response', tasks };
};

const buildRespondToClaimSection = (claim: Claim): TaskList => {
  const tasks: Task[] = [];

  tasks.push(chooseAResponseTask);
  // if (!claim.paymentOption) {
  //   tasks.push(howMuchYouHavePaidTask);
  // }
  return { title: 'Respond to Claim', tasks };
};

const buildSubmitSection = (claim: Claim): TaskList => {
  const tasks: Task[] = [];

  tasks.push(checkAndSubmitYourResponseTask);
  return { title: 'Submit', tasks };
};

// const buildTryToResolveClaimSection = async (claim: Claim): Promise<TaskList> => {
//   const tasks: Task[] = [];

//   if (!claim.paymentOption) {
//     tasks.push(howMuchYouHavePaidTask);
//     tasks.push(freeTelephoneMediation);
//   }
//   return { title: 'Try to resolve the Claim', tasks };
// };

// const buildYourHearingRequirementsSection = async (claim: Claim): Promise<TaskList> => {
//   const tasks: Task[] = [];

//   if (claim.paymentOption) {
//     tasks.push(howMuchYouHavePaidTask);
//   }
//   return { title: 'Your hearing requirements', tasks };
// };

export {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection,
  buildSubmitSection,
  // buildTryToResolveClaimSection,
  // buildYourHearingRequirementsSection,
};
