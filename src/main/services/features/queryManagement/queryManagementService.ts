import {AppRequest} from 'models/AppRequest';
import {SummarySection} from 'models/summaryList/summarySections';
import {generateRedisKeyForFile, getQueryFilesFromRedis, saveFilesToRedis} from 'modules/draft-store/draftStoreService';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
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
