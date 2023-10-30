import {Router} from 'express';
import {CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../urls';
import {getDescription, getTitle} from 'services/features/common/taskListService';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getClaimantResponseTaskLists} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {Claim} from 'models/claim';

const claimantResponseTasklistViewPath = 'features/claimantResponse/claimant-response-task-list';
const claimantResponseTasklistController = Router();

claimantResponseTasklistController.get(CLAIMANT_RESPONSE_TASK_LIST_URL, async (req: AppRequest, res, next) => {
  try {
    const claimId = req.params.id;
    req.session.claimId = claimId;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getClaimById(claimId, req, true);
    const taskLists = getClaimantResponseTaskLists(claim, claimId, lang);
    res.render(claimantResponseTasklistViewPath, {
      claim,
      taskLists,
      title: getTitle(taskLists, lang),
      description: getDescription(taskLists, lang),
    });
  } catch (error) {
    next(error); //
  }
});

export default claimantResponseTasklistController;
