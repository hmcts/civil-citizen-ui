import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {UploadDocument} from 'form/models/caseProgression/uploadDocumentstype';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getSupportRequired = async (claimId: string): Promise<UploadDocument> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    //TODO implement populate service
    return new UploadDocument();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
