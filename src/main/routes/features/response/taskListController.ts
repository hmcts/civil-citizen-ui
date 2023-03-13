import {Router} from 'express';
import {CLAIM_DETAILS_URL, RESPONSE_TASK_LIST_URL} from '../../urls';
import {getDescription, getTaskLists, getTitle} from '../../../services/features/common/taskListService';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from '../../../modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('taskListController');

const taskListViewPath = 'features/response/task-list';
const taskListController = Router();

taskListController.get(RESPONSE_TASK_LIST_URL, async (req: AppRequest, res, next) => {
  logger.error('task list controller1 {}', req.session?.user?.accessToken);
  try {
    const currentClaimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caseData: Claim = await getClaimById(currentClaimId, req);
    const taskLists = getTaskLists(caseData, currentClaimId, lang);

    req.session.claimId = currentClaimId;

    const title = getTitle(taskLists, lang);
    const description = getDescription(taskLists, lang);
    const claimDetailsUrl = constructResponseUrlWithIdParams(currentClaimId, CLAIM_DETAILS_URL);
    logger.error('task list controller2 {}', req.session?.user?.accessToken);
    res.render(taskListViewPath, {taskLists, title, description, claim: caseData, claimDetailsUrl});
    logger.error('task list controller3 after render {}', req.session?.user?.accessToken);
  } catch (error) {
    next(error);
  }
});

export default taskListController;

