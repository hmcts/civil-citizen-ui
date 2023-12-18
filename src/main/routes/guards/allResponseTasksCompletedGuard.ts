import {NextFunction, Request, Response} from 'express';
import {Task} from 'models/taskList/task';
import {getTaskLists, outstandingTasksFromTaskLists} from 'services/features/common/taskListService';
import assert from 'assert';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {isCarmEnabledForCase} from 'common/utils/carmToggleUtils';
export class AllResponseTasksCompletedGuard {
  static apply(redirectUrl: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const appReq: AppRequest = <AppRequest>req;
        const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
        const caseData: Claim = await getClaimById(appReq.session.claimId, req, true);
        const carmApplicable = await isCarmEnabledForCase(caseData.submittedDate);
        await setResponseDeadline(caseData, appReq);
        const taskLists = getTaskLists(caseData,  appReq.session.claimId, lang, carmApplicable);
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
