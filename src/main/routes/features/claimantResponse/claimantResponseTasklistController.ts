import {Router} from 'express';
import {CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../urls';
import {getDescription, getTitle} from 'services/features/common/taskListService';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getClaimantResponseTaskLists} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {Claim} from 'models/claim';
import {isMintiEnabledForCase, isCarmEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';

const claimantResponseTasklistViewPath = 'features/claimantResponse/claimant-response-task-list';
const claimantResponseTasklistController = Router();

claimantResponseTasklistController.get(CLAIMANT_RESPONSE_TASK_LIST_URL, async (req: AppRequest, res, next) => {
  try {
    const claimId = req.params.id;
    req.session.claimId = claimId;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getClaimById(claimId, req, true);
    const carmApplicable = await isCarmEnabledForCase(claim.submittedDate);
    const mintiApplicable = await isMintiEnabledForCase(claim.submittedDate);
    const taskLists = getClaimantResponseTaskLists(claim, claimId, lang, carmApplicable, mintiApplicable);
    res.render(claimantResponseTasklistViewPath, {
      claim,
      taskLists,
      title: getTitle(taskLists, lang),
      description: getDescription(taskLists, lang),
      pageTitle: 'PAGES.CLAIMANT_RESPONSE_TASK_LIST.PAGE_TITLE',
    });
  } catch (error) {
    next(error); //
  }
});

export default claimantResponseTasklistController;
