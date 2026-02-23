import {
  deleteFieldDraftClaimFromStore, generateRedisKey,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {QueryManagement, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
import {getClaimById} from 'modules/utilityService';
import {Request} from 'express';
import {
  CANCEL_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {SummarySection} from 'models/summaryList/summarySections';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {GenericForm} from 'form/models/genericForm';
import {summaryRow} from 'models/summaryList/summaryList';
import {CreateQuery, UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {t} from 'i18next';
import {translateErrors} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';
import {FILE_UPLOAD_SOURCE} from 'common/utils/fileUploadUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

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
  [WhatToDoTypeOption.CHANGE_CASE]: 'PAGES.QM.CAPTIONS.CHANGE_CASE',
};

export const uploadSelectedFile = async (req: AppRequest, createQuery: CreateQuery | SendFollowUpQuery, isFollowUp = false): Promise<void> => {
  try {
    const source = isFollowUp ? FILE_UPLOAD_SOURCE.QM_SEND_FOLLOW_UP : FILE_UPLOAD_SOURCE.QM_CREATE_QUERY;
    const uploadQMAdditionalFile = await createUploadDocLinks(req, source);
    await saveDocumentToUploaded(req, uploadQMAdditionalFile, createQuery, isFollowUp);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

export const createUploadDocLinks = async (req: AppRequest, fileUploadSource: string) => {
  const uploadQMAdditionalFile = new UploadQMAdditionalFile();
  const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
  uploadQMAdditionalFile.fileUpload = fileUpload;
  const form = new GenericForm(uploadQMAdditionalFile);
  form.validateSync();
  delete uploadQMAdditionalFile.fileUpload; // release file memory
  if (!form.hasErrors()) {
    uploadQMAdditionalFile.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(req, fileUpload);
  } else {
    const errors = translateErrors(form.getAllErrors(), t);
    req.session.fileUpload = JSON.stringify(errors);
    req.session.fileUploadSource = fileUploadSource;
  }
  return uploadQMAdditionalFile;
};

const saveDocumentToUploaded = async (req: AppRequest, file: UploadQMAdditionalFile, createQuery: CreateQuery | SendFollowUpQuery, isFollowUp = false): Promise<void> => {
  try {
    if (file.caseDocument) {
      createQuery.uploadedFiles.push(file);
    }
    await saveQueryManagement(req.params.id, createQuery, isFollowUp? 'sendFollowUpQuery' : 'createQuery', req);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getSummaryList = async (formattedSummary: SummarySection, req: AppRequest, isFollowUp = false): Promise<void> => {
  const claim = await getClaimById(req.params.id, req, true);
  const queryManagement = claim.queryManagement;
  const query = isFollowUp ? queryManagement?.sendFollowUpQuery : queryManagement?.createQuery;

  if (query) {
    const uploadedFiles = query.uploadedFiles;
    let index = 0;
    uploadedFiles.forEach((file: UploadQMAdditionalFile) => {
      index++;
      formattedSummary.summaryList.rows.push(
        summaryRow(
          file.caseDocument.documentName,
          String(index),
        ),
      );
    });
  }
};

export const removeSelectedDocument = async (req: AppRequest, index: number, query: CreateQuery | SendFollowUpQuery,  isFollowUp = false): Promise<void> => {
  try {
    query.uploadedFiles.splice(index, 1);
    await saveQueryManagement(req.params.id, query, isFollowUp ? 'sendFollowUpQuery' : 'createQuery', req);

  } catch (error) {
    logger.error(error);
    throw error;
  }
};
