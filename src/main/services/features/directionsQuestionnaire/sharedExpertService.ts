import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DQ - Shared expert');
const sharedExpertErrorMessage = 'ERRORS.VALID_SHARED_EXPERT';

const getSharedExpertSelection = async (claimId: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.sharedExpert ?
      caseData.directionQuestionnaire.sharedExpert :
      new GenericYesNo(undefined, sharedExpertErrorMessage);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getSharedExpertForm = (sharedExpert: string): GenericYesNo => {
  return new GenericYesNo(sharedExpert, sharedExpertErrorMessage);
};

const saveSharedExpertSelection = async (claimId: string, sharedExpert: GenericYesNo) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    const directionQuestionnaire = caseData?.directionQuestionnaire ? caseData?.directionQuestionnaire : new DirectionQuestionnaire();
    directionQuestionnaire.sharedExpert = sharedExpert;
    caseData.directionQuestionnaire = directionQuestionnaire;
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getSharedExpertSelection,
  getSharedExpertForm,
  saveSharedExpertSelection,
};
