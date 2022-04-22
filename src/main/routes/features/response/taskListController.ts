import {TaskList} from '../../../common/models/taskList/taskList';
import * as express from 'express';
import {CLAIM_TASK_LIST_URL} from '../../urls';
import {getTitle, getDescription} from '../../../modules/taskListService';
import {
  buildPrepareYourResponseSection,
  buildRespondeToClaimSection,
  buildTryToResolveClaimSection,
  buildYourHearingRequirementsSection,
} from '../../../common/utils/taskList/taskListBuilder';
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

    // TASK BUILDER
    const taskListPrepareYourResponse: TaskList = await buildPrepareYourResponseSection(claim);
    const taskListRespondeToClaim: TaskList = await buildRespondeToClaimSection(claim);
    const taskListTryToResolveClaim: TaskList = await buildTryToResolveClaimSection(claim);
    const taskListYourHearingRequirements: TaskList = await buildYourHearingRequirementsSection(claim);

    // GENERATE DATA, TITLE AND DESCRIPTION
    let data = [];
    data.push(
      taskListPrepareYourResponse,
      taskListRespondeToClaim,
      taskListTryToResolveClaim,
      taskListYourHearingRequirements,
    );
    data = data.filter(item => item.tasks.length !== 0);
    const title = getTitle(data);
    const description = getDescription(data);

    // RENDER VIEW
    res.render(taskListViewPath, { data, title, description });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }


});

export default taskListController;

