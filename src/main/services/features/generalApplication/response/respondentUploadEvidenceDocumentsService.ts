import {SummarySection} from 'models/summaryList/summarySections';
import { generateRedisKeyForGA } from 'modules/draft-store/draftStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {summaryRow} from 'models/summaryList/summaryList';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import { GA_RESPONDENT_UPLOAD_DOCUMENT_URL } from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {uploadEachSelectedFile} from 'services/features/generalApplication/documentUpload/uploadEachSelectedFile';
import {saveUploadErrorsToSession} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {FILE_UPLOAD_SOURCE} from 'common/utils/fileUploadUtils';
import { getDraftGARespondentResponse, saveDraftGARespondentResponse } from './generalApplicationResponseStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

export const getSummaryList = async (formattedSummary: SummarySection, redisKey: string, claimId: string, appId: string): Promise<void> => {
  const gaResponse = await getDraftGARespondentResponse(redisKey);
  let index = 0;
  gaResponse?.uploadEvidenceDocuments?.forEach((uploadDocument: UploadGAFiles) => {
    index= index+ 1;
    return formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_UPLOAD_DOCUMENT_URL + '?id=' + index), 'Remove document'));
  });
  return undefined;
};

export const saveDocumentsToUploaded = async (redisKey: string, uploadDocument: UploadGAFiles): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    await saveDraftGARespondentResponse(redisKey, gaResponse);
    gaResponse.uploadEvidenceDocuments.push(uploadDocument);
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const removeDocumentFromRedis = async (redisKey: string, index: number) : Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse?.uploadEvidenceDocuments?.splice(index, 1);
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch(error) {
    logger.error(error);
    throw error;
  }
};

export const uploadSelectedFile = async (req: AppRequest, summarySection: SummarySection, claimId: string, appId: string): Promise<void> => {
  try {
    const redisKey = generateRedisKeyForGA(req);
    const errors = await uploadEachSelectedFile(req, () => new UploadGAFiles(), (uploadDocument) => saveDocumentsToUploaded(redisKey, uploadDocument));
    await getSummaryList(summarySection, redisKey, claimId, appId);
    saveUploadErrorsToSession(req, errors, FILE_UPLOAD_SOURCE.GA_RESPONDENT_UPLOAD);
  } catch(error) {
    logger.error(error);
    throw error;
  }
};
