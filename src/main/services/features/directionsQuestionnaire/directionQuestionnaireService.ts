import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('directionQuestionnaireService');

const getDirectionQuestionnaire = async (claimId: string): Promise<DirectionQuestionnaire> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.directionQuestionnaire) return new DirectionQuestionnaire();
    return new DirectionQuestionnaire(
      claim.directionQuestionnaire?.triedToSettle,
      claim.directionQuestionnaire?.defendantExpertEvidence,
    );
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveDirectionQuestionnaire = async (claimId: string, value: any, directionQuestionnairePropertyName: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if (claim.directionQuestionnaire) {
      claim.directionQuestionnaire[directionQuestionnairePropertyName] = value;
    } else {
      const directionQuestionnaire: any = new DirectionQuestionnaire();
      directionQuestionnaire[directionQuestionnairePropertyName] = value;
      claim.directionQuestionnaire = directionQuestionnaire;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {getDirectionQuestionnaire, saveDirectionQuestionnaire};
