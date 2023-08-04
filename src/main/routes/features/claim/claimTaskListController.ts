import {Router, Response, NextFunction} from 'express';
import {CLAIMANT_TASK_LIST_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import {getTaskLists} from 'services/features/claim/taskListService';
import {calculateTotalAndCompleted} from 'services/features/common/taskListService';
import {t} from 'i18next';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const taskListViewPath = 'features/claim/task-list';
const claimTaskListController = Router();

claimTaskListController.get(CLAIMANT_TASK_LIST_URL, (req: AppRequest, res: Response, next: NextFunction): void => {
  const userId = req.session?.user?.id;
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  getCaseDataFromStore(userId)
    .then((caseData) => {
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
