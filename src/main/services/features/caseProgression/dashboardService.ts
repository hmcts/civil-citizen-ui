import {getDashboardFromCache, saveDashboardToCache} from 'modules/draft-store/getDashboardCache';
import {TaskListBuilder} from 'models/taskList/taskListBuilder';
import {Claim} from 'models/claim';
import {TaskList} from 'models/taskList/taskList';
import {t} from 'i18next';
import {TaskItem} from 'models/taskList/task';
import {TaskStatus, TaskStatusColor} from 'models/taskList/TaskStatus';
import {Dashboard} from 'models/caseProgression/dashboard';
import {ClaimantOrDefendant} from 'models/partyType';
import {PaymentStatus} from 'models/PaymentDetails';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardService');
export const getDashboardForm = async (claim: Claim,claimId: string):Promise<TaskList[]> => {
  try {
    const caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
    const cachedDashboard:Dashboard = await getDashboardFromCache(caseRole,claimId);
    if(cachedDashboard?.items?.length) {
      return cachedDashboard.items;
    }
    const dashboard:TaskList[] = generateNewDashboard(claim);
    await saveDashboard(dashboard,claim, claimId);
    return dashboard;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveDashboard = async (dashboard:TaskList[], claim:Claim, claimId:string) =>{
  try {
    const caseRole = claim.isClaimant()?ClaimantOrDefendant.CLAIMANT:ClaimantOrDefendant.DEFENDANT;
    await saveDashboardToCache(dashboard,caseRole, claimId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
export const generateNewDashboard = (claim: Claim): TaskList[] => {

  const newDashboard: TaskList[] = [];
  if ((!claim.isLRClaimant() && claim.isClaimant()) || (!claim.isClaimant() && !claim.isLRDefendant())) {
    const hearings: TaskList = new TaskListBuilder(t('PAGES.DASHBOARD.HEARINGS.TITLE'))
      .addTask(new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_HEARINGS'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
      .addTask(new TaskItem(t('PAGES.DASHBOARD.HEARINGS.UPLOAD_DOCUMENTS'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
      .addTask(new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_DOCUMENTS'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])).build();
    if (claim.isFastTrackClaim) {
      hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.ADD_TRIAL'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));
    }
    if (!claim.isLRClaimant() && claim.isClaimant()) {
      hearings.tasks.push((checkHearingPaymentStatus(claim)));
    }
    hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_BUNDLE'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));

    const noticeAndOrders = new TaskListBuilder(t('PAGES.DASHBOARD.ORDERS_NOTICE.TITLE'))
      .addTask(new TaskItem(t('PAGES.DASHBOARD.ORDERS_NOTICE.VIEW'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
      .build();

    newDashboard.push(hearings);
    newDashboard.push(noticeAndOrders);
  }
  return newDashboard;
};

const checkHearingPaymentStatus = (claim: Claim): TaskItem => {
  if (claim.hearingFeePaymentDetails?.status === PaymentStatus.SUCCESS) {
    return  new TaskItem(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE'), undefined, TaskStatus.DONE, false, TaskStatusColor[TaskStatus.DONE]);
  }
  return new TaskItem(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]);
};

