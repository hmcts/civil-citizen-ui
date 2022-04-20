import { TaskList } from '../../../common/form/models/taskList';
import * as express from 'express';
import { CLAIM_TASK_LIST_URL } from '../../urls';
import { getTitle, getDescription } from '../../../modules/taskListService';
import {
  buildPrepareYourResponseSection,
  buildRespondeToClaimSection,
  buildTryToResolveClaimSection,
  buildYourHearingRequirementsSection,
  buildSubmitSection
} from '../../../common/utils/taskListBuilder';

const taskListViewPath = 'features/response/draft-task-list';
const taskListController = express.Router();

taskListController.get(CLAIM_TASK_LIST_URL, async (req, res) => {

  const claimId = req.params.id

  // TASK BUILDER
  const taskListPrepareYourResponse: TaskList = await buildPrepareYourResponseSection(claimId);
  const taskListRespondeToClaim: TaskList = await buildRespondeToClaimSection(claimId);
  const taskListTryToResolveClaim: TaskList = await buildTryToResolveClaimSection(claimId);
  const taskListYourHearingRequirements: TaskList = await buildYourHearingRequirementsSection(claimId);
  const taskListSubmit: TaskList = buildSubmitSection();

  // GENERATE TITLE AND DESCRIPTION
  let data = [];
  data.push(
    taskListPrepareYourResponse,
    taskListRespondeToClaim,
    taskListTryToResolveClaim,
    taskListYourHearingRequirements,
    taskListSubmit
  );

  const title = getTitle(data);
  const description = getDescription(data);

  // RENDER VIEW
  res.render(taskListViewPath, { data, title, description });
});

export default taskListController;

