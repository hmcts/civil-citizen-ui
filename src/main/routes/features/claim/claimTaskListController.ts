import {Router, Response, NextFunction, RequestHandler} from 'express';
import {CLAIMANT_TASK_LIST_URL, MEDIATION_TYPE_OF_DOCUMENTS} from '../../urls';
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
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const taskListViewPath = 'features/claim/task-list';
const claimTaskListController = Router();

claimTaskListController.get(CLAIMANT_TASK_LIST_URL, claimIssueTaskListGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caseData: Claim = await getCaseDataFromStore(userId, true);
    if (!caseData?.isDraftClaim()) {
      await createDraftClaimInStoreWithExpiryTime(userId);
    }
    const taskLists = getTaskLists(caseData, userId, lang);
    const {completed, total} = calculateTotalAndCompleted(taskLists);
    const description = t('PAGES.CLAIM_TASK_LIST.COMPLETED_SECTIONS', {completed, total});
    const title = completed < total ? t('PAGES.CLAIM_TASK_LIST.APPLICATION_COMPLETE') : t('PAGES.CLAIM_TASK_LIST.APPLICATION_INCOMPLETE');
    
    const breadcrumbUrlA = '#A';
    const breadcrumbUrlB = '#B';
    const breadcrumbUrlC = '#C';

    res.render(
      taskListViewPath, 
      {taskLists, title, description, breadcrumbUrlA, breadcrumbUrlB, breadcrumbUrlC, backLinkUrl: constructResponseUrlWithIdParams('123', MEDIATION_TYPE_OF_DOCUMENTS)}, 
    );
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimTaskListController;
