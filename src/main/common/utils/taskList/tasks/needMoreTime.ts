import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';

/**
 * THIS FILE IS A CONCEPT AND DOESN'T WORK
 * 
 * The logic on this file is not the real business logic.
 * This code is only a concept of what we should do. 
 * 
 */

const needMoreTimeTask = {
  description: 'Response deadline',
  url: '/more-time',
  status: TaskStatus.INCOMPLETE,
};

export const getneedMoreTimeTask = (claim: Claim): Task => {

  if (claim.statementOfMeans?.cohabiting?.option === 'yes') {
    needMoreTimeTask.status = TaskStatus.COMPLETE;
  }

  return needMoreTimeTask;
};

