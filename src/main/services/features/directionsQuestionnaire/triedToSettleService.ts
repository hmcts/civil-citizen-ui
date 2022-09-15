import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DQ - Tried to settle');
const triedToSettleErrorMessage = 'ERRORS.VALID_TRIED_TO_SETTLE';

const getTriedToSettle = async (claimId: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.triedToSettle ?
      caseData.directionQuestionnaire.triedToSettle :
      new GenericYesNo(undefined, triedToSettleErrorMessage);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getTriedToSettleForm = (triedToSettle: string): GenericYesNo => {
  return new GenericYesNo(triedToSettle, triedToSettleErrorMessage);
};

const saveTriedToSettle = async (claimId: string, triedToSettle: GenericYesNo) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    (caseData?.directionQuestionnaire) ?
      caseData.directionQuestionnaire = {...caseData.directionQuestionnaire, triedToSettle} :
      caseData.directionQuestionnaire = {...new DirectionQuestionnaire(), triedToSettle};
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getTriedToSettle,
  getTriedToSettleForm,
  saveTriedToSettle,
};
