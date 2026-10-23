import {AppRequest} from 'models/AppRequest';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {uploadEachSelectedFile} from 'services/features/generalApplication/documentUpload/uploadEachSelectedFile';
import {saveUploadErrorsToSession} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {getGADocumentsFromDraftStore, saveGADocumentsInDraftStore} from 'modules/draft-store/draftGADocumentService';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

export const uploadSelectedFile = async (req: AppRequest, fileUploadSource?: string): Promise<void> => {
  try {
    const errors = await uploadEachSelectedFile(req, () => new UploadGAFiles(), (uploadDocument) => saveDocuments(req, uploadDocument));
    saveUploadErrorsToSession(req, errors, fileUploadSource);
  } catch(error) {
    logger.error(error);
    throw error;
  }
};

export const saveDocuments = async (req: AppRequest, uploadDocument: UploadGAFiles): Promise<void> => {
  try {
    const redisKey = generateRedisKeyForGA(req);
    const uploadDocuments = await getGADocumentsFromDraftStore(redisKey);
    uploadDocuments.push(uploadDocument);
    await saveGADocumentsInDraftStore(redisKey, uploadDocuments);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const removeSelectedDocument = async (redisKey: string, index: number) : Promise<void> => {
  try {
    const uploadedDocuments = await getGADocumentsFromDraftStore(redisKey);
    uploadedDocuments.splice(index, 1);
    await saveGADocumentsInDraftStore(redisKey, uploadedDocuments);
  } catch(error) {
    logger.error(error);
    throw error;
  }
};

export const translateCUItoCCD = (uploadDocumentsList: UploadGAFiles[]) => {
  return uploadDocumentsList?.map(uploadDocument => {
    return {
      value: {
        document_url: uploadDocument?.caseDocument?.documentLink?.document_url,
        document_binary_url: uploadDocument?.caseDocument?.documentLink?.document_binary_url,
        document_filename: uploadDocument?.caseDocument?.documentLink?.document_filename,
        category_id: uploadDocument?.caseDocument?.documentLink?.category_id,
      },
    };
  });
};
