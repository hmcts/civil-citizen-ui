import {SummarySection} from 'models/summaryList/summarySections';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_UPLOAD_DOCUMENTS_COSC_URL, GA_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import { FormValidationError } from 'common/form/validationErrors/formValidationError';
import { t } from 'i18next';
import {isConfirmYouPaidCCJAppType} from 'services/features/generalApplication/generalApplicationService';
import { Response } from 'express';
import { getMulterErrorConstraint, FILE_UPLOAD_SOURCE } from 'common/utils/fileUploadUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

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

export const removeSelectedDocument = async (redisKey: string, index: number) : Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(redisKey, true);
    claim?.generalApplication?.uploadEvidenceForApplication?.splice(index, 1);
    await saveDraftClaim(redisKey, claim);
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
    const uploadDocument = new UploadGAFiles();
    const redisKey = generateRedisKey(req);
    const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
    uploadDocument.fileUpload = fileUpload;
    const form = new GenericForm(uploadDocument);
    form.validateSync();
    delete uploadDocument.fileUpload;      //release file memory
    if (!form.hasErrors()) {
      uploadDocument.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);

      await saveDocumentsToUploaded(redisKey, uploadDocument);
      await getSummaryList(summarySection, redisKey, claimId);
    } else {
      const errors = translateErrors(form.getAllErrors(), t);
      req.session.fileUpload = JSON.stringify(errors);
      req.session.fileUploadSource = FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE;
    }
  } catch(error) {
    logger.error(error);
    throw error;
  }
};

export const redirectIfMulterError = (req: AppRequest, res: Response, currentUrl: string, fileUploadSource?: string): boolean => {
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
  res.redirect(`${currentUrl}`);
  return true;
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
