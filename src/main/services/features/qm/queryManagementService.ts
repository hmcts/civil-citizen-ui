import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {t} from 'i18next';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {QueryManagement, WhatToDoTypeOption} from 'form/models/qm/queryManagement';
import {deleteFieldDraftClaimFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Request} from 'express';
import {CANCEL_URL} from 'routes/urls';

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

export const saveQueryManagement = async (claimId: string, value: any, queryManagementPropertyName: keyof QueryManagement,  req: Request): Promise<void> => {
  const claim = await getClaimById(claimId, req,true);
  if (!claim.queryManagement) {
    claim.queryManagement = new QueryManagement();
  }
  claim.queryManagement[queryManagementPropertyName] = value;
  await saveDraftClaim(claimId, claim);
};

export const getQueryManagement = async (claimId: string, req: Request): Promise<QueryManagement> => {
  const claim = await getClaimById(claimId, req,true);
  if (!claim.queryManagement) {
    return new QueryManagement();
  }
  return claim.queryManagement;
};

export const deleteQueryManagement = async (claimId: string, req: Request): Promise<void> => {
  const claim = await getClaimById(claimId, req,true);
  await deleteFieldDraftClaimFromStore(claimId, claim, 'queryManagement');
};

export const getCancelUrl = (claimId: string) => {
  return CANCEL_URL
    .replace(':id', claimId)
    .replace(':propertyName', 'queryManagement');
};

export const getCaption = (option: WhatToDoTypeOption) => {
  return captionMap[option];
};

const captionMap: Partial<Record<WhatToDoTypeOption, string>> = {
  [WhatToDoTypeOption.GET_UPDATE]: 'PAGES.QM.CAPTIONS.GET_UPDATE',
  [WhatToDoTypeOption.SEND_UPDATE]: 'PAGES.QM.CAPTIONS.SEND_UPDATE',
  [WhatToDoTypeOption.SEND_DOCUMENTS]: 'PAGES.QM.CAPTIONS.SEND_DOCUMENTS',
  [WhatToDoTypeOption.SOLVE_PROBLEM]: 'PAGES.QM.CAPTIONS.SOLVE_PROBLEM',
  [WhatToDoTypeOption.MANAGE_HEARING]: 'PAGES.QM.CAPTIONS.MANAGE_HEARING',
};

