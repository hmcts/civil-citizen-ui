import {NextFunction, Response} from 'express';
import {Task} from 'models/taskList/task';
import {outstandingTasksFromTaskLists} from 'services/features/common/taskListService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {BASE_ELIGIBILITY_URL, CLAIM_INCOMPLETE_SUBMISSION_URL} from 'routes/urls';
import {getTaskLists} from 'services/features/claim/taskListService';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {getStashedClaimOrFromStore, stashClaimOnRequest} from 'common/utils/claimRequestLocals';

export const checkYourAnswersClaimGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
    // doNotThrowError (3rd arg): a draft that has already been submitted (and therefore deleted
    // from the draft store) returns an empty claim rather than throwing 'Case not found'. This
    // keeps the check-and-send GET idempotent when a claim is submitted and the page is re-entered
    // (e.g. browser back/refresh, or concurrent requests under load) instead of returning a 500.
    const caseData: Claim = await getStashedClaimOrFromStore(req, userId, true);
    stashClaimOnRequest(req, caseData);

    if (!caseData.isDraftClaim()) {
      return res.redirect(BASE_ELIGIBILITY_URL);
    }

    const taskLists = getTaskLists(caseData,  userId, lang);
    /**
     * We have to check that all sections are completed except Submit section
     * so we mark submit section as COMPLETE to ignore it.
     */
    taskLists[2].tasks[0].status = TaskStatus.COMPLETE;
    const outstandingTasks: Task[] = outstandingTasksFromTaskLists(taskLists);
    const allTasksCompleted = outstandingTasks?.length === 0;

    if (allTasksCompleted) {
      return next();
    }

    return res.redirect(CLAIM_INCOMPLETE_SUBMISSION_URL);
  } catch (error) {
    next(error);
  }
};
