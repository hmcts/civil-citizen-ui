import {NextFunction, Response} from 'express';
import {Task} from 'models/taskList/task';
import {outstandingTasksFromTaskLists} from 'services/features/common/taskListService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {CLAIM_INCOMPLETE_SUBMISSION_URL, DASHBOARD_URL} from 'routes/urls';
import {getTaskLists} from 'services/features/claim/taskListService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {TaskStatus} from 'common/models/taskList/TaskStatus';

export const checkYourAnswersClaimGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
    const caseData: Claim = await getCaseDataFromStore(userId);

    if (!caseData.id) {
      return res.redirect(DASHBOARD_URL);
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
