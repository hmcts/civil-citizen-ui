import {NextFunction, Router, RequestHandler} from 'express';
import {
  CLAIM_INCOMPLETE_SUBMISSION_URL, CLAIMANT_TASK_LIST_URL,
} from '../../urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {outstandingTasksFromCase} from 'services/features/claim/taskListService';
const incompleteSubmissionViewPath = 'features/response/incomplete-submission';
const incompleteClaimIssueSubmissionController = Router();

incompleteClaimIssueSubmissionController.get(CLAIM_INCOMPLETE_SUBMISSION_URL, (async (req, res, next: NextFunction) => {
  try {
    const userId = (<AppRequest>req).session?.user?.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(userId);
    const taskLists = outstandingTasksFromCase(claim, userId, lang);
    res.render(incompleteSubmissionViewPath, {
      tasks: taskLists,
      taskListUri: constructResponseUrlWithIdParams(req.params.id, CLAIMANT_TASK_LIST_URL),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default incompleteClaimIssueSubmissionController;

