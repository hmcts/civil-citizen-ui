import {NextFunction, Request, Response} from 'express';
import {Task} from 'models/taskList/task';
import {getTaskLists, outstandingTasksFromTaskLists} from 'services/features/common/taskListService';
import assert from 'assert';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import {AppRequest} from 'models/AppRequest';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {isMintiEnabledForCase, isCarmEnabledForCase} from '../../app/auth/launchdarkly/launchDarklyClient';
import {stashClaimOnRequest} from 'common/utils/claimRequestLocals';
import {getRouteParam} from 'common/utils/routeParamUtils';

export class AllResponseTasksCompletedGuard {
  static apply(redirectUrl: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const appReq: AppRequest = <AppRequest>req;
        const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
        const caseId = getRouteParam(req, 'id');
        const claim = await getResponseClaimById(appReq, caseId);
        stashClaimOnRequest(req, claim);
        const carmApplicable = await isCarmEnabledForCase(claim.submittedDate);
        const mintiApplicable = await isMintiEnabledForCase(claim.submittedDate);
        await setResponseDeadline(claim, appReq);
        const taskLists = getTaskLists(claim, caseId, lang, carmApplicable, mintiApplicable);
        assert(taskLists && taskLists.length > 0, 'Task list cannot be empty');
        const outstandingTasks: Task[] = outstandingTasksFromTaskLists(taskLists);
        const allTasksCompleted = outstandingTasks?.length === 0;

        if (allTasksCompleted) {
          return next();
        }

        res.redirect(constructResponseUrlWithIdParams(caseId, redirectUrl));
      } catch (error) {
        next(error);
      }
    };
  }

}
