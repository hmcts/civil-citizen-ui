import {NextFunction, Response} from 'express';
import {Task} from 'models/taskList/task';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL} from 'routes/urls';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import { getClaimById } from 'modules/utilityService';
import { getClaimantResponseTaskLists, outstandingClaimantResponseTasks } from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';

export const claimantResponsecheckYourAnswersGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const userId = req.session?.user?.id;
    const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
    const claim: Claim = await getClaimById(claimId, req, true);

    
    const claim: Claim = await getClaimById(claimId, req, true);
    const taskLists = outstandingClaimantResponseTasks(claim, userId, lang);
    const taskLists = getClaimantResponseTaskLists(claim,  userId, lang);
    
    /**
     * We have to check that all sections are completed except Submit section
     * so we mark submit section as COMPLETE to ignore it.
     */
    taskLists[2].tasks[0].status = TaskStatus.COMPLETE;
    const outstandingTasks: Task[] = outstandingClaimantResponseTasks(taskLists);
    const allTasksCompleted = outstandingTasks?.length === 0;

    if (allTasksCompleted) {
      return next();
    }

    return res.redirect(CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL);
  } catch (error) {
    next(error);
  }
};
