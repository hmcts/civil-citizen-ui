import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {Router} from 'express';
import {getClaimById} from 'modules/utilityService';
import {CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {getDescription, getTaskLists, getTitle} from 'services/features/response/taskListService';

const taskListViewPath = 'features/claimantResponse/claimant-response-task-list';
const claimantResponseTaskListController = Router();

claimantResponseTaskListController.get(CLAIMANT_RESPONSE_TASK_LIST_URL, async (req: AppRequest, res, next) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getClaimById(claimId, req);
    const taskLists = getTaskLists(claim, claimId, lang);

    req.session.claimId = claimId;

    const title = getTitle(taskLists, lang);
    const description = getDescription(taskLists, lang);
    res.render(taskListViewPath, {taskLists, title, description, claim});
  } catch (error) {
    next(error);
  }
});

export default claimantResponseTaskListController;

