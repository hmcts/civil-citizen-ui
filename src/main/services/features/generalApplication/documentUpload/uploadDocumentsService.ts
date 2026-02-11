import {AppRequest} from 'models/AppRequest';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {GenericForm} from 'form/models/genericForm';
import {translateErrors} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {t} from 'i18next';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getGADocumentsFromDraftStore, saveGADocumentsInDraftStore} from 'modules/draft-store/draftGADocumentService';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

export const uploadSelectedFile = async (req: AppRequest, fileUploadSource?: string): Promise<void> => {
  try {
    const uploadDocument = new UploadGAFiles();
    const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
    uploadDocument.fileUpload = fileUpload;
    const form = new GenericForm(uploadDocument);
    form.validateSync();
    delete uploadDocument.fileUpload; // release file memory
    if (!form.hasErrors()) {
      uploadDocument.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
      await saveDocuments(req, uploadDocument);
    } else {
      const errors = translateErrors(form.getAllErrors(), t);
      req.session.fileUpload = JSON.stringify(errors);
      req.session.fileUploadSource = fileUploadSource;
    }
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
