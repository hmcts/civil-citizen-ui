import * as express from 'express';
import {TaskList} from '../../common/models/taskList/taskList';
import {Task} from '../../common/models/taskList/task';
import {outstandingTasksFromTaskLists} from '../../modules/taskListService';
import assert from 'assert';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';

export class AllResponseTasksCompletedGuard {

  static apply(redirectUrl: string) {
    return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      try {

        const taskLists: TaskList[] = req.session.taskLists;
        assert(taskLists && taskLists.length > 0, 'Task list cannot be empty');
        const outstandingTasks: Task[] = outstandingTasksFromTaskLists(taskLists);
        const allTasksCompleted = outstandingTasks?.length === 0;

        if (allTasksCompleted) {
          return next();
        }

        res.redirect(constructResponseUrlWithIdParams(req.session.claimId, redirectUrl));
      } catch (error) {
        next(error);
      }
    };
  }
}
