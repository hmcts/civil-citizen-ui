import {NextFunction, Router} from 'express';
import {RESPONSE_TASK_LIST_URL, RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../urls';
import {outstandingTasksFromCase} from 'services/features/common/taskListService';
import {Task} from 'models/taskList/task';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
const incompleteSubmissionViewPath = 'features/response/incomplete-submission';
const incompleteSubmissionController = Router();

incompleteSubmissionController.get(RESPONSE_INCOMPLETE_SUBMISSION_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    const tasks: Task[] = outstandingTasksFromCase(claim, claimId, lang);
    res.render(incompleteSubmissionViewPath, {
      tasks: tasks,
      taskListUri: constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL),
    });
  } catch (error) {
    next(error);
  }
});

export default incompleteSubmissionController;

