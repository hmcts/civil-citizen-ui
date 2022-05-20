import * as express from 'express';
import {
  CLAIM_TASK_LIST_URL,
  RESPONSE_INCOMPLETE_SUBMISSION_URL,
} from '../../urls';
import {outstandingTasksFromCase} from '../../../modules/taskListService';
import {Task} from '../../../common/models/taskList/task';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersController');

const incompleteSubmissionViewPath = 'features/response/incomplete-submission';
const incompleteSubmissionController = express.Router();

incompleteSubmissionController.get(RESPONSE_INCOMPLETE_SUBMISSION_URL, async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    const tasks: Task[] = outstandingTasksFromCase(claim, claimId);
    res.render(incompleteSubmissionViewPath, {
      tasks: tasks,
      taskListUri: CLAIM_TASK_LIST_URL.replace(':id', req.params.id),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default incompleteSubmissionController;

