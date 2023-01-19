import {Router} from 'express';
import {CLAIM_DETAILS_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../urls';
import {getDescription, getTitle} from '../../../services/features/response/taskListService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from '../../../modules/utilityService';
import {getClaimantResponseTaskLists} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';

const claimantResponseTasklistViewPath = 'features/claimantResponse/claimant-response-task-list';
const claimantResponseTasklistController = Router();

claimantResponseTasklistController.get(CLAIMANT_RESPONSE_TASK_LIST_URL, async (req: AppRequest, res, next) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req);
    const taskLists = getClaimantResponseTaskLists(claim, claimId, lang);

    req.session.claimId = claimId;

    const title = getTitle(taskLists, lang);
    const description = getDescription(taskLists, lang);
    const claimDetailsUrl = constructResponseUrlWithIdParams(claimId, CLAIM_DETAILS_URL); // check this out if still required
    res.render(claimantResponseTasklistViewPath, {taskLists, title, description, claim, claimDetailsUrl});
  } catch (error) {
    next(error);
  }
});

export default claimantResponseTasklistController;

