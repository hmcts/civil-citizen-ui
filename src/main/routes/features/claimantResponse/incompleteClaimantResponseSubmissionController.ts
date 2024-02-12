import {NextFunction, Router, RequestHandler} from 'express';
import {
  CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL, CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import { outstandingClaimantResponseTasks } from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import { getClaimById } from 'modules/utilityService';
import { Claim } from 'common/models/claim';
import {isCarmEnabledForCase} from 'common/utils/carmToggleUtils';

const incompleteSubmissionViewPath = 'features/response/incomplete-submission';
const incompleteClaimantResponseSubmissionController = Router();

incompleteClaimantResponseSubmissionController.get(CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const userId = (<AppRequest>req).session?.user?.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getClaimById(claimId, req, true);
    const carmApplicable = await isCarmEnabledForCase(claim.submittedDate);
    const taskLists = outstandingClaimantResponseTasks(claim, userId, lang, carmApplicable);
    res.render(incompleteSubmissionViewPath, {
      tasks: taskLists,
      taskListUri: constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_TASK_LIST_URL),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default incompleteClaimantResponseSubmissionController;

