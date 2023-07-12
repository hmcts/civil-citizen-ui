import {Router} from 'express';
import {CLAIMANT_TASK_LIST_URL} from '../../urls';
import {Claim} from 'models/claim';
// import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getTaskLists} from 'services/features/claim/taskListService';

const taskListViewPath = 'features/claim/task-list';
const claimTaskListController = Router();

claimTaskListController.get(CLAIMANT_TASK_LIST_URL, async (req: AppRequest, res, next) => {
  try {
    const claimId = req.session.claimId;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caseData: Claim = await getClaimById(claimId, req);
    const taskLists = getTaskLists(caseData, claimId, lang);

    // const title = getTitle(taskLists, lang);
    // const description = getDescription(taskLists, lang);
    // const claimDetailsUrl = constructResponseUrlWithIdParams(claimId, CLAIM_DETAILS_URL);
    res.render(taskListViewPath, {taskLists});
  } catch (error) {
    next(error);
  }
});

export default claimTaskListController;

