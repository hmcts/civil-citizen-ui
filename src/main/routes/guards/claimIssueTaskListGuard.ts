import {NextFunction, Request, Response} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {BASE_ELIGIBILITY_URL, CLAIM_INCOMPLETE_SUBMISSION_URL} from 'routes/urls';
import {getTaskLists, outstandingTasksFromTaskLists} from 'services/features/common/taskListService';
import assert from 'assert';
import {Task} from 'models/taskList/task';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

export const claimIssueTaskListGuard = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const appReq: AppRequest = <AppRequest>req;
      const userId = appReq.session?.user?.id;
      const caseData: Claim = await getCaseDataFromStore(userId);
      if (!caseData.id && !req.cookies['eligibilityCompleted']){
        res.redirect(BASE_ELIGIBILITY_URL);
      }else{
        const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
        const taskLists = getTaskLists(caseData,  appReq.session.claimId, lang);
        assert(taskLists && taskLists.length > 0, 'Task list cannot be empty');
        const outstandingTasks: Task[] = outstandingTasksFromTaskLists(taskLists);

        const allTasksCompleted = outstandingTasks?.length === 0;
        if (allTasksCompleted) {
          return next();
        }

        res.redirect(constructResponseUrlWithIdParams(appReq.session.claimId, CLAIM_INCOMPLETE_SUBMISSION_URL));
      }
    } catch (error) {
      next(error);
    }
  })();
};

