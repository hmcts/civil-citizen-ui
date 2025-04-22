import {AppRequest} from 'models/AppRequest';
import {UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import {SummarySection} from 'models/summaryList/summarySections';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {QM_FOLLOW_UP_MESSAGE} from 'routes/urls';

import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';
import {createUploadDocLinks, getQueryManagement} from "services/features/queryManagement/queryManagementService";

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


