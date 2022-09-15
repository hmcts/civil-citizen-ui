import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DQ - Request Extra 4 Weeks to settle');
const requestExtra4weeksErrorMessage = 'ERRORS.VALID_REQUEST_EXTRA_4_WEEKS';

const getRequestExtra4weeks = async (claimId: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.requestExtra4weeks ? caseData.directionQuestionnaire.requestExtra4weeks : new GenericYesNo(undefined, requestExtra4weeksErrorMessage);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getRequestExtra4weeksForm = (requestExtra4weeks: string): GenericYesNo => {
  return new GenericYesNo(requestExtra4weeks, requestExtra4weeksErrorMessage);
};

const saveRequestExtra4weeks = async (claimId: string, requestExtra4weeks: GenericYesNo) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData?.directionQuestionnaire) {
      caseData.directionQuestionnaire = {...caseData.directionQuestionnaire, requestExtra4weeks};
    } else {
      caseData.directionQuestionnaire = {...new DirectionQuestionnaire(), requestExtra4weeks};
    }
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getRequestExtra4weeks,
  getRequestExtra4weeksForm,
  saveRequestExtra4weeks,
};
