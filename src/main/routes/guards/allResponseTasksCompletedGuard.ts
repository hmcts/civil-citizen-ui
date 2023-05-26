import {NextFunction, Response} from 'express';
import {Task} from 'models/taskList/task';
import {getTaskLists, outstandingTasksFromTaskLists} from 'services/features/common/taskListService';
import assert from 'assert';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {setResponseDeadline} from 'services/features/common/responseDeadlineService';
export class AllResponseTasksCompletedGuard {
  static apply(redirectUrl: string) {
    return async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const appReq: AppRequest = <AppRequest>req;
        const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
        const caseData: Claim = await getCaseDataFromStore(appReq.session.claimId);
        await setResponseDeadline(caseData, req);
        const taskLists = getTaskLists(caseData, appReq.session.claimId, lang);
        assert(taskLists && taskLists.length > 0, 'Task list cannot be empty');
        const outstandingTasks: Task[] = outstandingTasksFromTaskLists(taskLists);
        const allTasksCompleted = outstandingTasks?.length === 0;

        if (allTasksCompleted) {
          return next();
        }

        res.redirect(constructResponseUrlWithIdParams(appReq.session.claimId, redirectUrl));
      } catch (error) {
        next(error);
      }
    };
  }

}
