import * as express from 'express';
import {CLAIM_TASK_LIST_URL, RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../urls';
import {outstandingTasksFromCase} from '../../../services/features/response/taskListService';
import {Task} from '../../../common/models/taskList/task';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const incompleteSubmissionViewPath = 'features/response/incomplete-submission';
const incompleteSubmissionController = express.Router();

incompleteSubmissionController.get(RESPONSE_INCOMPLETE_SUBMISSION_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(claimId);
    const tasks: Task[] = outstandingTasksFromCase(claim, claimId, lang);
    res.render(incompleteSubmissionViewPath, {
      tasks: tasks,
      taskListUri: constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL),
    });
  } catch (error) {
    next(error);
  }
});

export default incompleteSubmissionController;

