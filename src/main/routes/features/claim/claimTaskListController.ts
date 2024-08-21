import {Router, Response, NextFunction, RequestHandler} from 'express';
import {CLAIMANT_TASK_LIST_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import {getTaskLists} from 'services/features/claim/taskListService';
import {calculateTotalAndCompleted} from 'services/features/common/taskListService';
import {t} from 'i18next';
import {
  createDraftClaimInStoreWithExpiryTime,
  getCaseDataFromStore,
} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {claimIssueTaskListGuard} from 'routes/guards/claimIssueTaskListGuard';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const taskListViewPath = 'features/claim/task-list';
const claimTaskListController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimTaskListController.get(CLAIMANT_TASK_LIST_URL, claimIssueTaskListGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const caseData: Claim = await getCaseDataFromStore(userId, true);
    if (!caseData?.isDraftClaim()) {
      await createDraftClaimInStoreWithExpiryTime(userId);
      await civilServiceClient.createDashboard(req);
    }
    const taskLists = getTaskLists(caseData, userId, lng);
    const {completed, total} = calculateTotalAndCompleted(taskLists);
    const description = t('PAGES.CLAIM_TASK_LIST.COMPLETED_SECTIONS', {completed, total, lng});
    const title = completed < total ? t('PAGES.CLAIM_TASK_LIST.APPLICATION_COMPLETE', {lng}) : t('PAGES.CLAIM_TASK_LIST.APPLICATION_INCOMPLETE', {lng});
    res.render(taskListViewPath, {taskLists, title, description, pageTitle:'PAGES.CLAIM_TASK_LIST.PAGE_TITLE'});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimTaskListController;
