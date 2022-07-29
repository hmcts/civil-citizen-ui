import {DeterminationWithoutHearing} from '../../../common/models/directionsQuestionnaire/determinationWithoutHearing';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('determinationWithoutHearing');

export const getDeterminationWithoutHearing = async (claimId: string): Promise<DeterminationWithoutHearing> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.determinationWithoutHearing ? caseData.determinationWithoutHearing : new DeterminationWithoutHearing();
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
    caseData.determinationWithoutHearing = determinationWithoutHearing;
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
