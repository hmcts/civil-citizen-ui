import {DeterminationWithoutHearing} from '../../../common/models/directionsQuestionnaire/determinationWithoutHearing';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('determinationWithoutHearing');

export const getDeterminationWithoutHearing = async (claimId: string): Promise<DeterminationWithoutHearing> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.determinationWithoutHearing ?
      caseData.directionQuestionnaire.determinationWithoutHearing :
      new DeterminationWithoutHearing();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getDeterminationWithoutHearingForm = (isDeterminationWithoutHearing: string, reasonForHearing: string): DeterminationWithoutHearing => {
  return new DeterminationWithoutHearing(
    isDeterminationWithoutHearing,
    isDeterminationWithoutHearing === YesNo.YES ? '' : reasonForHearing);
};

export const saveDeterminationWithoutHearing = async (claimId: string, determinationWithoutHearing: DeterminationWithoutHearing) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData?.directionQuestionnaire) {
      caseData.directionQuestionnaire = {...caseData.directionQuestionnaire, determinationWithoutHearing};
    } else {
      caseData.directionQuestionnaire = {...new DirectionQuestionnaire(), determinationWithoutHearing};
    }
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
