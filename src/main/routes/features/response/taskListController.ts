import * as express from 'express';
import {CLAIM_TASK_LIST_URL, CLAIM_DETAILS_URL} from '../../urls';
import {getTaskLists, getTitle, getDescription} from '../../../services/features/response/taskListService';
import {Claim} from '../../../common/models/claim';
import {getDraftClaimFromStore, getCaseDataFromStore } from '../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const taskListViewPath = 'features/response/task-list';
const taskListController = express.Router();

taskListController.get(CLAIM_TASK_LIST_URL, async (req, res, next) => {
  try {
    const currentClaimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getDraftClaimFromStore(currentClaimId);

    const caseData = await getCaseDataFromStore(currentClaimId);
    const taskLists = getTaskLists(claim, caseData, currentClaimId, lang);

    req.session.claimId = currentClaimId;
    req.session.taskLists = taskLists;

    const title = getTitle(taskLists, lang);
    const description = getDescription(taskLists, lang);
    const claimDetailsUrl = constructResponseUrlWithIdParams(currentClaimId, CLAIM_DETAILS_URL);
    res.render(taskListViewPath, { taskLists, title, description, claim: caseData, claimDetailsUrl });
  } catch (error) {
    next(error);
  }
});

export default taskListController;

