import {Router, Response, NextFunction} from 'express';
import {CLAIMANT_TASK_LIST_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import {getTaskLists} from 'services/features/claim/taskListService';
import {calculateTotalAndCompleted} from 'services/features/common/taskListService';
import {t} from 'i18next';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {isCUIReleaseTwoEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {claimIssueTaskListGuard} from 'routes/guards/claimIssueTaskListGuard';

const taskListViewPath = 'features/claim/task-list';
const claimTaskListController = Router();

claimTaskListController.get(CLAIMANT_TASK_LIST_URL, claimIssueTaskListGuard, async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.session?.user?.id;
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const isReleasedTwoEnabled = await isCUIReleaseTwoEnabled();
  getCaseDataFromStore(userId)
    .then((caseData) => {

      if(isReleasedTwoEnabled) {
        saveDraftClaim(null, undefined);
      } else {
        const claim = new Claim();
        claim.createAt = new Date();
        saveDraftClaim(userId, claim);
      }

      const taskLists = getTaskLists(caseData, userId, lang);
      const {completed, total} = calculateTotalAndCompleted(taskLists);
      const description = t('PAGES.CLAIM_TASK_LIST.COMPLETED_SECTIONS', {completed, total});
      const title = completed < total ? t('PAGES.CLAIM_TASK_LIST.APPLICATION_COMPLETE') : t('PAGES.CLAIM_TASK_LIST.APPLICATION_INCOMPLETE');
      res.render(taskListViewPath, {taskLists, title, description});
    })
    .catch((error) => {
      next(error);
    });
});

export default claimTaskListController;
