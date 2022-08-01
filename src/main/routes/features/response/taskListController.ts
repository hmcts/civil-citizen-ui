import * as express from 'express';
import {CLAIM_DETAILS_URL, CLAIM_TASK_LIST_URL} from '../../urls';
import {getDescription, getTaskLists, getTitle} from '../../../services/features/response/taskListService';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';

const taskListViewPath = 'features/response/task-list';
const taskListController = express.Router();

taskListController.get(CLAIM_TASK_LIST_URL, async (req: AppRequest, res, next) => {
  try {
    const currentClaimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caseData: Claim = await getCaseDataFromStore(currentClaimId);
    const taskLists = getTaskLists(caseData, currentClaimId, lang);

    req.session.claimId = currentClaimId;

    const title = getTitle(taskLists, lang);
    const description = getDescription(taskLists, lang);
    const claimDetailsUrl = constructResponseUrlWithIdParams(currentClaimId, CLAIM_DETAILS_URL);
    res.render(taskListViewPath, {taskLists, title, description, claim: caseData, claimDetailsUrl});
  } catch (error) {
    next(error);
  }
});

export default taskListController;

