import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';
import {ConsiderClaimantDocuments} from 'models/directionsQuestionnaire/considerClaimantDocuments';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getConsiderClaimantDocuments = async (claimId: string): Promise<ConsiderClaimantDocuments> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return (caseData.considerClaimantDocuments) ? caseData.considerClaimantDocuments :  new ConsiderClaimantDocuments();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getConsiderClaimantDocumentsForm = (option: string, details: string): ConsiderClaimantDocuments => {
  const considerClaimantDocumentsDetails = (option === YesNo.NO) ? '' : details;
  return (option) ?
    new ConsiderClaimantDocuments(option, considerClaimantDocumentsDetails) :
    new ConsiderClaimantDocuments();
};

export const saveConsiderClaimantDocuments = async (claimId: string, considerClaimantDocuments: ConsiderClaimantDocuments) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.considerClaimantDocuments = considerClaimantDocuments;
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
