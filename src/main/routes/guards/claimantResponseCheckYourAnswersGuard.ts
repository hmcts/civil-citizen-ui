import {NextFunction, Response} from 'express';
import {Task} from 'models/taskList/task';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL} from 'routes/urls';
import { getClaimById } from 'modules/utilityService';
import {outstandingClaimantResponseTasks } from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import {isCarmEnabledForCase} from 'common/utils/carmToggleUtils';

export const claimantResponsecheckYourAnswersGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const userId = req.session?.user?.id;
    const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
    const claim: Claim = await getClaimById(claimId, req, true);
    const carmApplicable = await isCarmEnabledForCase(claim.submittedDate);
    const outstandingTasks: Task[]  = outstandingClaimantResponseTasks(claim, userId, lang, carmApplicable);
    const allTasksCompleted = outstandingTasks?.length === 0;

    if (allTasksCompleted) {
      return next();
    }

    return res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL));
  } catch (error) {
    next(error);
  }
};
