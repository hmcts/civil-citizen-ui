import {
  deleteFieldDraftClaimFromStore,
  generateRedisKeyForFile, getQueryFilesFromRedis,
  saveDraftClaim, saveFilesToRedis,
} from 'modules/draft-store/draftStoreService';
import {QueryManagement, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
import {getClaimById} from 'modules/utilityService';
import {Request} from 'express';
import {
  CANCEL_URL, QUERY_MANAGEMENT_CREATE_QUERY,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {SummarySection} from 'models/summaryList/summarySections';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {GenericForm} from 'form/models/genericForm';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseDocument} from 'models/document/caseDocument';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

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

export const uploadSelectedFile = async (req: AppRequest, summarySection: SummarySection, claimId: string): Promise<GenericForm<FileUpload>> => {
  try {
    const fileForm = new FileUpload();
    const redisKey = generateRedisKeyForFile(req);
    const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
    fileForm.mimetype = fileUpload ? fileUpload.mimetype : '';
    fileForm.size = fileUpload ? fileUpload.size : NaN;
    const form = new GenericForm(fileForm);
    form.validateSync();
    if (!form.hasErrors()) {
      const savedFile = await civilServiceClientForDocRetrieve.uploadDocument(req, fileUpload);
      await saveDocumentToUploaded(redisKey, savedFile);
      await getSummaryList(summarySection, redisKey, claimId);
    }
    return form;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

const saveDocumentToUploaded = async (redisKey: string, file: CaseDocument): Promise<void> => {
  try {
    const existingFiles = await getQueryFilesFromRedis(redisKey);
    existingFiles.push(file);
    await saveFilesToRedis(redisKey, existingFiles);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getSummaryList = async (formattedSummary: SummarySection, redisKey: string, claimId: string): Promise<void> => {
  const uploadedFiles = await getQueryFilesFromRedis(redisKey);
  let index = 0;
  uploadedFiles.forEach((file: CaseDocument) => {
    index++;
    formattedSummary.summaryList.rows.push(summaryRow(file.documentName, '', constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY+'?id='+index), 'Remove document'));
  });
};

export const removeSelectedDocument = async (redisKey: string, index: number): Promise<void> => {
  try {
    const files = await getQueryFilesFromRedis(redisKey);
    files.splice(index, 1);
    await saveFilesToRedis(redisKey, files);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

