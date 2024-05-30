import {SummarySection} from 'models/summaryList/summarySections';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_RESPONDENT_UPLOAD_DOCUMENT} from 'routes/urls';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {t} from 'i18next';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {translateErrors} from 'services/features/generalApplication/uploadEvidenceDocumentService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

export const getSummaryList = async (formattedSummary: SummarySection, redisKey: string, claimId: string): Promise<void> => {
  const claim = await getCaseDataFromStore(redisKey);
  let index = 0;
  claim?.generalApplication?.response?.uploadEvidenceDocuments?.forEach((uploadDocument: UploadGAFiles) => {
    index= index+ 1;
    return formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', constructResponseUrlWithIdParams(claimId, GA_RESPONDENT_UPLOAD_DOCUMENT+'?id='+index), 'Remove document'));
  });
  return undefined;
};

export const saveDocumentsToUploaded = async (claimId: string, uploadDocument: UploadGAFiles): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.response = Object.assign(new GaResponse(), claim.generalApplication.response);
    claim.generalApplication.response.uploadEvidenceDocuments.push(uploadDocument);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const removeDocumentFromRedis = async (redisKey: string, index: number) : Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(redisKey, true);
    claim?.generalApplication?.response?.uploadEvidenceDocuments?.splice(index, 1);
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
    if (!form.hasErrors()) {
      uploadDocument.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
      await saveDocumentsToUploaded(redisKey, uploadDocument);
      await getSummaryList(summarySection, redisKey, claimId);
    } else {
      const errors = translateErrors(form.getAllErrors(), t);
      req.session.fileUpload = JSON.stringify(errors);
    }
  } catch(error) {
    logger.error(error);
    throw error;
  }
};
