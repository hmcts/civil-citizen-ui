import {DeterminationWithoutHearing} from '../../../common/models/directionsQuestionnaire/hearing/determinationWithoutHearing';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('determinationWithoutHearing');

export const getDeterminationWithoutHearing = async (claimId: string): Promise<DeterminationWithoutHearing> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.hearing?.determinationWithoutHearing ?
      caseData.directionQuestionnaire?.hearing?.determinationWithoutHearing :
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
