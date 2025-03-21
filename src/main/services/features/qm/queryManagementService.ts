import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {t} from 'i18next';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {Claim} from 'models/claim';

export const updateQueryManagementDashboardItems = (dashboard: Dashboard, gaExclusion: DashboardTaskList, claim: Claim) => {
  dashboard.items.forEach(item => {
    if (item.categoryEn === gaExclusion.categoryEn) {
      updateDashboardTaskHeader(item, 'COMMON.QUERY_MANAGEMENT_DASHBOARD.APPLICATION_HEADING');
      item.tasks.forEach(taskItem => {
        if (taskItem.taskNameEn.includes('Contact the court to request a change to my case')) {
          updateDashboardTaskItem(taskItem, 'COMMON.QUERY_MANAGEMENT_DASHBOARD.APPLICATIONS_TASK');
        } else {
          updateDashboardTaskItem(taskItem, 'COMMON.QUERY_MANAGEMENT_DASHBOARD.VIEW_MESSAGES_TASK');
          determineTaskStatus(taskItem, claim);
        }
      });
    }
  });
};

const updateDashboardTaskHeader = (header: DashboardTaskList, updatedValueLocation: string) => {
  header.categoryEn = t(updatedValueLocation, {lng: 'en'});
  header.categoryCy = t(updatedValueLocation, {lng: 'cy'});
};

const updateDashboardTaskItem = (item: DashboardTask, updatedValueLocation: string) => {
  item.taskNameEn = t(updatedValueLocation, {lng: 'en'});
  item.taskNameCy = t(updatedValueLocation, {lng: 'cy'});
};

const determineTaskStatus = (taskItem: DashboardTask, claim: Claim) => {
  if (claim.isClaimant()) {
    if (!claim.qmApplicantLipQueries) {
      taskItem.statusEn = t('PAGES.TASK_LIST.NOT_AVAILABLE_YET', {lng: 'en'});
      taskItem.statusCy = t('PAGES.TASK_LIST.NOT_AVAILABLE_YET', {lng: 'cy'});
    }
  } else {
    if (!claim.qmDefendantLipQueries) {
      taskItem.statusEn = t('PAGES.TASK_LIST.NOT_AVAILABLE_YET', {lng: 'en'});
      taskItem.statusCy = t('PAGES.TASK_LIST.NOT_AVAILABLE_YET', {lng: 'cy'});
    }
  }
};
