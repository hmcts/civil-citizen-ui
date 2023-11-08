import {getDashboardFromCache, saveDashboardToCache} from 'modules/draft-store/getDashboardCache';
import {TaskListBuilder} from 'models/taskList/taskListBuilder';
import {Claim} from 'models/claim';
import {TaskList} from 'models/taskList/taskList';
import {t} from 'i18next';
import {TaskItem} from 'models/taskList/task';
import {TaskStatus, TaskStatusColor} from 'models/taskList/TaskStatus';
import {Dashboard} from 'models/caseProgression/dashboard';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardService');
const getDashboardForm = async (claim: Claim,claimId: string, lng: string):Promise<TaskList[]> => {
  try {
    const cachedDashboard:Dashboard = await getDashboardFromCache(claimId);
    if(!cachedDashboard || !cachedDashboard.items.length) {
      const dashboard:TaskList[] = generateNewDashboard(claim,lng);
      return dashboard;
    }
    return cachedDashboard.items;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveDashboard = async (dashboard:TaskList[], claimId:string) =>{
  try {
    await saveDashboardToCache(dashboard, claimId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const generateNewDashboard = (claim: Claim, lng: string): TaskList[] => {

  const newDashboard: TaskList[] = [];

  const hearings: TaskList = new TaskListBuilder(t('PAGES.DASHBOARD.HEARINGS.TITLE'))
    .addTask(new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_HEARINGS'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
    .addTask(new TaskItem(t('PAGES.DASHBOARD.HEARINGS.UPLOAD_DOCUMENTS'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
    .addTask(new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_DOCUMENTS'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])).build();
  if (claim.isClaimant() ) {
    hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));
  }
  if (claim.isFastTrackClaim){
    hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.ADD_TRIAL'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));
  }
  hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_BUNDLE'), '#',TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));

  const noticeAndOrders =  new TaskListBuilder(t('PAGES.DASHBOARD.ORDERS_NOTICE.TITLE'))
    .addTask(new TaskItem(t('PAGES.DASHBOARD.ORDERS_NOTICE.VIEW'), '#',TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
    .build();

  newDashboard.push(hearings);
  newDashboard.push(noticeAndOrders);

  return newDashboard;
};

export {
  getDashboardForm,
  saveDashboard,
  generateNewDashboard,
};
