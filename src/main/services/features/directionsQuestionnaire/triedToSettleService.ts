import {TriedToSettle} from '../../../common/models/directionsQuestionnaire/triedToSettle';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DQ - Tried to settle');

const getTriedToSettle = async (claimId: string): Promise<TriedToSettle> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.triedToSettle ? caseData.directionQuestionnaire.triedToSettle : new TriedToSettle();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getTriedToSettleForm = (triedToSettle: string): TriedToSettle => {
  return new TriedToSettle(triedToSettle);
};

const saveTriedToSettle = async (claimId: string, triedToSettle: TriedToSettle) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    let directionQuestionnaire = caseData?.directionQuestionnaire;
    if (directionQuestionnaire) {
      directionQuestionnaire = {...directionQuestionnaire};
      directionQuestionnaire.triedToSettle = triedToSettle;
    } else {
      caseData.directionQuestionnaire = new DirectionQuestionnaire();
      caseData.directionQuestionnaire.triedToSettle = triedToSettle;
    }
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
