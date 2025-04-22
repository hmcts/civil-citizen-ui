import {AppRequest} from 'models/AppRequest';
import {UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import {SummarySection} from 'models/summaryList/summarySections';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {QM_FOLLOW_UP_MESSAGE} from 'routes/urls';

import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('sendFollowUpQueryService');

export const uploadSelectedFile = async (req: AppRequest, sendFollowUpQuery: SendFollowUpQuery): Promise<void> => {
  try {
    const uploadQMAdditionalFile = new UploadQMAdditionalFile();//await createUploadDocLinks(req);
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
    //await saveQueryManagement(req.params.id, sendFollowUpQuery, 'sendFollowUpQuery', req);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getSummaryList = async (formattedSummary: SummarySection, req: AppRequest): Promise<void> => {
  const queryManagement = new QueryManagement();//await getQueryManagement(req.params.id, req);
  if (queryManagement.sendFollowUpQuery) {
    const uploadedFiles = queryManagement.sendFollowUpQuery.uploadedFiles;
    const claimId = req.params.id;
    let index = 0;
    uploadedFiles.forEach((file: UploadQMAdditionalFile) => {
      index++;
      formattedSummary.summaryList.rows.push(summaryRow(file.caseDocument.documentName, '', constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_MESSAGE + '?id=' + index), 'Remove document'));
    });
  }
};

export const removeSelectedDocument = async (req: AppRequest, index: number): Promise<void> => {
  try {
    const queryManagement = new QueryManagement();//await getQueryManagement(req.params.id, req);
    const sendFollowUpQuery = queryManagement.sendFollowUpQuery;
    sendFollowUpQuery.uploadedFiles.splice(index, 1);
    //await saveQueryManagement(req.params.id, sendFollowUpQuery, 'sendFollowUpQuery', req);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
