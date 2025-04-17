import {
  deleteFieldDraftClaimFromStore, generateRedisKey,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {QueryManagement, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
import {getClaimById} from 'modules/utilityService';
import {Request} from 'express';
import {
  CANCEL_URL, QUERY_MANAGEMENT_CREATE_QUERY,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {SummarySection} from 'models/summaryList/summarySections';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {GenericForm} from 'form/models/genericForm';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CreateQuery, UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {t} from 'i18next';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {translateErrors} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {Claim} from 'models/claim';

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
  const claim = await getClaimById(req.params.id, req, true);
  if (!claim.queryManagement) {
    claim.queryManagement = new QueryManagement();
  }
  claim.queryManagement[queryManagementPropertyName] = value;
  await saveDraftClaim(generateRedisKey(<AppRequest>req), claim);
};

export const getQueryManagement = async (claimId: string, req: Request): Promise<QueryManagement> => {
  const claim = await getClaimById(req.params.id, req, true);
  if (!claim.queryManagement) {
    return new QueryManagement();
  }
  return claim.queryManagement;
};

export const deleteQueryManagement = async (claimId: string, req: Request): Promise<void> => {
  const claim = await getClaimById(req.params.id, req, true);
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

export const uploadSelectedFile = async (req: AppRequest, createQuery: CreateQuery): Promise<void> => {
  try {
    const uploadQMAdditionalFile = await createUploadDocLinks(req);
    await saveDocumentToUploaded(req, uploadQMAdditionalFile, createQuery);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

export const createUploadDocLinks = async (req: AppRequest) => {
  const uploadQMAdditionalFile = new UploadQMAdditionalFile();
  const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
  uploadQMAdditionalFile.fileUpload = fileUpload;
  const form = new GenericForm(uploadQMAdditionalFile);
  form.validateSync();
  if (!form.hasErrors()) {
    uploadQMAdditionalFile.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(req, fileUpload);
  } else {
    const errors = translateErrors(form.getAllErrors(), t);
    req.session.fileUpload = JSON.stringify(errors);
  }
  return uploadQMAdditionalFile;
}

const saveDocumentToUploaded = async (req: AppRequest, file: UploadQMAdditionalFile, createQuery: CreateQuery): Promise<void> => {
  try {
    if (file.caseDocument) {
      createQuery.uploadedFiles.push(file);
    }
    await saveQueryManagement(req.params.id, createQuery, 'createQuery', req);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getSummaryList = async (formattedSummary: SummarySection, req: AppRequest): Promise<void> => {
  const queryManagement = await getQueryManagement(req.params.id, req);
  if (queryManagement.createQuery) {
    const uploadedFiles = queryManagement.createQuery.uploadedFiles;
    const claimId = req.params.id;
    let index = 0;
    uploadedFiles.forEach((file: UploadQMAdditionalFile) => {
      index++;
      formattedSummary.summaryList.rows.push(summaryRow(file.caseDocument.documentName, '', constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY + '?id=' + index), 'Remove document'));
    });
  }
};

export const removeSelectedDocument = async (req: AppRequest, index: number): Promise<void> => {
  try {
    const queryManagement = await getQueryManagement(req.params.id, req);
    const createQuery = queryManagement.createQuery;
    createQuery.uploadedFiles.splice(index, 1);
    await saveQueryManagement(req.params.id, createQuery, 'createQuery', req);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

