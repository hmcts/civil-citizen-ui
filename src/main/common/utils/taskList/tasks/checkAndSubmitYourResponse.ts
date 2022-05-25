import { Task } from '../../../models/taskList/task';
import { Claim } from '../../../models/claim';
import { TaskStatus } from '../../../models/taskList/TaskStatus';
import { constructResponseUrlWithIdParams } from '../../urlFormatter';

/**
 *
 * this file needs to be revisited when check and submit page is developed.
 *
 */

const checkAndSubmitYourResponseTask = {
  description: 'Check and submit your response',
  url: '/incomplete-submission',
  status: TaskStatus.INCOMPLETE,
};

export const getCheckAndSubmitYourResponseTask = (_claim: Claim, _caseData: Claim, claimId: string, isIncompleteSubmission: boolean): Task => {
  const taskStatus = TaskStatus.INCOMPLETE;
  // TODO : create the logic for successful submit and change the taskStatus to TaskStatus.COMPLETE
  // TODO : update the URL constants with the correct ones when these pages developed
  const redirectionURL = isIncompleteSubmission ? 'incomplete-submission' : 'check-and-send';
  const constructedUrl = constructResponseUrlWithIdParams(claimId, redirectionURL);
  return { ...checkAndSubmitYourResponseTask, url: constructedUrl, status: taskStatus };
};
