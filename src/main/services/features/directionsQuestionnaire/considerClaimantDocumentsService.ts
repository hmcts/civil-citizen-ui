import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';
import {
  ConsiderClaimantDocuments,
} from '../../../common/models/directionsQuestionnaire/hearing/considerClaimantDocuments';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from '../../../common/models/directionsQuestionnaire/hearing/hearing';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getConsiderClaimantDocuments = async (claimId: string): Promise<ConsiderClaimantDocuments> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.directionQuestionnaire?.hearing.considerClaimantDocuments ? caseData.directionQuestionnaire.hearing.considerClaimantDocuments : new ConsiderClaimantDocuments();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getConsiderClaimantDocumentsForm = (option: YesNo, details: string): ConsiderClaimantDocuments => {
  const considerClaimantDocumentsDetails = (option === YesNo.NO) ? '' : details;
  return (option) ?
    new ConsiderClaimantDocuments(option, considerClaimantDocumentsDetails) :
    new ConsiderClaimantDocuments();
};

export const saveConsiderClaimantDocuments = async (claimId: string, considerClaimantDocuments: ConsiderClaimantDocuments) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);

    if (caseData?.directionQuestionnaire?.hearing) {
      caseData.directionQuestionnaire.hearing = {...caseData.directionQuestionnaire.hearing, considerClaimantDocuments};
    } else {
      caseData.directionQuestionnaire = new DirectionQuestionnaire();
      caseData.directionQuestionnaire.hearing = new Hearing();
      caseData.directionQuestionnaire.hearing.considerClaimantDocuments = considerClaimantDocuments;
    }

    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
