import {SummarySection} from 'models/summaryList/summarySections';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_UPLOAD_DOCUMENTS_COSC_URL, GA_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {uploadEachSelectedFile} from 'services/features/generalApplication/documentUpload/uploadEachSelectedFile';
import { FormValidationError } from 'common/form/validationErrors/formValidationError';
import { t } from 'i18next';
import {isConfirmYouPaidCCJAppType} from 'services/features/generalApplication/generalApplicationService';
import { getMulterErrorConstraint, FILE_UPLOAD_SOURCE } from 'common/utils/fileUploadUtils';
import {deleteRemovedGADocuments} from 'services/features/generalApplication/documentUpload/deleteUploadedGADocuments';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

export const getSummaryList = async (formattedSummary: SummarySection, redisKey: string, claimId: string): Promise<void> => {
  const claim = await getCaseDataFromStore(redisKey);
  const isConfirmPaidCCJAppType = isConfirmYouPaidCCJAppType(claim);
  const currentPage = isConfirmPaidCCJAppType ? GA_UPLOAD_DOCUMENTS_COSC_URL : GA_UPLOAD_DOCUMENTS_URL;
  let index = 0;
  claim?.generalApplication?.uploadEvidenceForApplication?.forEach((uploadDocument: UploadGAFiles) => {
    index= index+ 1;
    formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', constructResponseUrlWithIdParams(claimId, currentPage+'?id='+index), 'Remove document'));
  });
};

export const saveDocumentsToUploaded = async (redisKey: string, uploadDocument: UploadGAFiles): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(redisKey, true);
    claim?.generalApplication?.uploadEvidenceForApplication.push(uploadDocument);
    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const removeSelectedDocument = async (req: AppRequest, redisKey: string, index: number) : Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(redisKey, true);
    const uploadedDocuments = claim?.generalApplication?.uploadEvidenceForApplication;
    const removedDocuments = uploadedDocuments?.splice(index, 1);
    await saveDraftClaim(redisKey, claim);
    await deleteRemovedGADocuments(req, removedDocuments, uploadedDocuments, 'uploadEvidenceDocumentService');
  } catch(error) {
    logger.error(error);
    throw error;
  }
};

export const removeAllUploadedDocuments = async (redisKey: string, claim: Claim) : Promise<void> => {
  try {
    if(claim?.generalApplication?.uploadEvidenceForApplication) {
      claim.generalApplication.uploadEvidenceForApplication = [];
    }
    await saveDraftClaim(redisKey, claim);
  } catch(error) {
    logger.error(error);
    throw error;
  }
};

export const uploadSelectedFile = async (req: AppRequest, summarySection: SummarySection, claimId: string): Promise<void> => {
  try {
    const redisKey = generateRedisKey(req);
    const errors = await uploadEachSelectedFile(req, () => new UploadGAFiles(), (uploadDocument) => saveDocumentsToUploaded(redisKey, uploadDocument));
    await getSummaryList(summarySection, redisKey, claimId);
    saveUploadErrorsToSession(req, errors, FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE);
  } catch(error) {
    logger.error(error);
    throw error;
  }
};

export const handleMulterError = (req: AppRequest, fileUploadSource?: string): boolean => {
  if (!(req as any).multerError || req.body?.action !== 'uploadButton') {
    return false;
  }
  const multerError = (req as any).multerError;
  const errorConstraint = getMulterErrorConstraint(multerError);
  const errorStructure: FormValidationError[] = [
    new FormValidationError({
      target: { fileUpload: '' },
      property: 'fileUpload',
      constraints: { multerError: errorConstraint },
    }),
  ];
  const translatedErrors = translateErrors(errorStructure, t);
  req.session.fileUpload = JSON.stringify(translatedErrors);
  req.session.fileUploadSource = fileUploadSource ?? FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE;
  return true;
};

export const saveUploadErrorsToSession = (req: AppRequest, errors: FormValidationError[], fileUploadSource?: string): void => {
  if (errors.length) {
    req.session.fileUpload = JSON.stringify(translateErrors(errors, t));
    req.session.fileUploadSource = fileUploadSource;
  }
};

export const translateErrors = (keys: FormValidationError[], t: (key: string) => string, formatValues?: { keyError: string, keyToReplace: string, valueToReplace: string }[]) => {
  return keys.map((key) => {
    if (formatValues) {
      const formatValue = formatValues.find(v => v.keyError === key.text);
      if (formatValue) {
        const translation = t(key.text);
        const replaced = translation.replace(formatValue.keyToReplace, formatValue.valueToReplace);
        return ({ ...key, text: replaced });
      }
    }
    if (key?.target) {
      key.target = {};
    }
    if (key?.text)
      return ({ ...key, text: t(key?.text) });
  }).filter(item => item);
};
