import * as express from 'express';

import {Task} from '../../common/models/taskList/task';
import {getTaskLists, outstandingTasksFromTaskLists} from '../../services/features/response/taskListService';
import assert from 'assert';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';

export class AllResponseTasksCompletedGuard {
  public static apply(redirectUrl: string) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      try {

        const lang = req.query.lang ? req.query.lang : req.cookies.lang;
        const caseData: Claim = await getCaseDataFromStore(req.session.claimId);
        const taskLists = getTaskLists(caseData, req.session.claimId, lang);
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
