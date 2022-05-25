import * as express from 'express';
import {TaskList} from '../../../../common/models/taskList/taskList';
import {Task} from '../../../../common/models/taskList/task';
import {RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../../urls';
import {outstandingTasksFromTaskLists} from '../../../../modules/taskListService';
import assert from 'assert';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

export class AllResponseTasksCompletedGuard {

  static async apply(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    try {

      const taskLists: TaskList[] = req.session.taskLists;
      assert(taskLists && taskLists.length > 0, 'Task list cannot be empty');
      const outstandingTasks: Task[] = outstandingTasksFromTaskLists(taskLists);
      const allTasksCompleted = outstandingTasks?.length === 0;

      if (allTasksCompleted) {
        return next();
      }

      res.redirect(constructResponseUrlWithIdParams(req.session.claimId, RESPONSE_INCOMPLETE_SUBMISSION_URL));
    } catch (error) {
      next(error);
    }
  }
}
