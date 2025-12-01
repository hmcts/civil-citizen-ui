import {NextFunction, RequestHandler, Router} from 'express';
import {RESPONSE_TASK_LIST_URL, RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../urls';
import {outstandingTasksFromCase} from 'services/features/common/taskListService';
import {Task} from 'models/taskList/task';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {isCarmEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';
const incompleteSubmissionViewPath = 'features/response/incomplete-submission';
const incompleteSubmissionController = Router();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('incompleteSubmissionController');

incompleteSubmissionController.get(RESPONSE_INCOMPLETE_SUBMISSION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    const carmApplicable = await isCarmEnabledForCase(claim.submittedDate);
    const tasks: Task[] = outstandingTasksFromCase(claim, claimId, lang, carmApplicable);
    res.render(incompleteSubmissionViewPath, {
      tasks: tasks,
      taskListUri: constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL),
      pageTitle: 'PAGES.INCOMPLETE_SUBMISSION.TITLE',
    });
  } catch (error) {
    logger.error(`Error when getting incomplete submission -  ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default incompleteSubmissionController;

