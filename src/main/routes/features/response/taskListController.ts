import * as express from 'express';
import {CLAIM_TASK_LIST_URL} from '../../urls';
import {getTaskLists, getTitle, getDescription} from '../../../modules/taskListService';
import {Claim} from '../../../common/models/claim';
import {getDraftClaimFromStore} from '../../../modules/draft-store/draftStoreService';


/**
 * THIS FILE IS A CONCEPT
 * 
 * This code is only a concept of what we should do. 
 * 
 */


const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('taskListController');
const taskListViewPath = 'features/response/task-list';
const taskListController = express.Router();

taskListController.get(CLAIM_TASK_LIST_URL, async (req, res) => {
  try {
    const claim: Claim = await getDraftClaimFromStore(req.params.id);
    const taskLists = await getTaskLists(claim);
    const title = getTitle(taskLists);
    const description = getDescription(taskLists);
    res.render(taskListViewPath, { taskLists, title, description });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

export default taskListController;

