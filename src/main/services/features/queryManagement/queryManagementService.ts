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

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
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

export const uploadSelectedFile = async (req: AppRequest, summarySection: SummarySection, claimId: string): Promise<void> => {
  try {
    const fileForm = new FileUpload();
    const redisKey = generateRedisKeyForFile(req);
    const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
    fileForm.mimetype = fileUpload.mimetype;
    fileForm.size = fileUpload.size;
    const form = new GenericForm(fileForm);
    form.validateSync();
    if (!form.hasErrors()) {
      await saveDocumentToUploaded(redisKey, fileUpload);
      await getSummaryList(summarySection, redisKey, claimId);
    }
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

const saveDocumentToUploaded = async (redisKey: string, file: FileUpload): Promise<void> => {
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
  uploadedFiles.forEach((file: FileUpload) => {
    index++;
    formattedSummary.summaryList.rows.push(summaryRow(file.originalname, '', constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY+'?id='+index), 'Remove document'));
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

