import {AppRequest} from 'models/AppRequest';
import {UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import {SummarySection} from 'models/summaryList/summarySections';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import {
  createUploadDocLinks,
  getQueryManagement,
  saveQueryManagement,
} from 'services/features/queryManagement/queryManagementService';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('sendFollowUpQueryService');

export const uploadSelectedFile = async (req: AppRequest, sendFollowUpQuery: SendFollowUpQuery): Promise<void> => {
  try {
    const uploadQMAdditionalFile = await createUploadDocLinks(req);
    await saveDocumentToUploaded(req, uploadQMAdditionalFile, sendFollowUpQuery);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

const saveDocumentToUploaded = async (req: AppRequest, file: UploadQMAdditionalFile, sendFollowUpQuery: SendFollowUpQuery): Promise<void> => {
  try {
    if (file.caseDocument) {
      sendFollowUpQuery.uploadedFiles.push(file);
    }
    await saveQueryManagement(req.params.id, sendFollowUpQuery, 'sendFollowUpQuery', req);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getSummaryList = async (formattedSummary: SummarySection, req: AppRequest): Promise<void> => {
  const queryManagement = await getQueryManagement(req.params.id, req);
  if (queryManagement.sendFollowUpQuery) {
    const uploadedFiles = queryManagement.sendFollowUpQuery.uploadedFiles;
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
    const sendFollowUpQuery = queryManagement.sendFollowUpQuery;
    sendFollowUpQuery.uploadedFiles.splice(index, 1);
    await saveQueryManagement(req.params.id, sendFollowUpQuery, 'sendFollowUpQuery', req);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
