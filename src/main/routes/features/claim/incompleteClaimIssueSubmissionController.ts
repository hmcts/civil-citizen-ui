import {NextFunction, Router, RequestHandler} from 'express';
import {
  CLAIM_INCOMPLETE_SUBMISSION_URL, CLAIMANT_TASK_LIST_URL,
} from '../../urls';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {outstandingTasksFromCase} from 'services/features/claim/taskListService';
const incompleteSubmissionViewPath = 'features/response/incomplete-submission';
const incompleteClaimIssueSubmissionController = Router();

incompleteClaimIssueSubmissionController.get(CLAIM_INCOMPLETE_SUBMISSION_URL, (async (req: AppRequest, res, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[incompleteClaimIssueSubmissionController] no draft claim found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const taskLists = outstandingTasksFromCase(claim, userId, lang);
    res.render(incompleteSubmissionViewPath, {
      tasks: taskLists,
      taskListUri: constructResponseUrlWithIdParams(req.params.id, CLAIMANT_TASK_LIST_URL),
      pageTitle: 'PAGES.INCOMPLETE_SUBMISSION.TITLE',
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default incompleteClaimIssueSubmissionController;

