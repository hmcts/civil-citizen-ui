import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {DelayedFlight} from 'common/models/delayedFlight';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('Claim - Claim Interest');

export const getDelayedFlight = async (claimId: string): Promise<DelayedFlight> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.delayedFlight?
      new DelayedFlight(
        caseData.delayedFlight?.option, 
        caseData.delayedFlight?.airline, 
        caseData.delayedFlight?.flightNumber, 
        caseData.delayedFlight?.year, 
        caseData.delayedFlight?.month, 
        caseData.delayedFlight?.day,
      ) :
      new DelayedFlight();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

// export const getDelayedFlightForm = (claimInterest: string): GenericYesNo => {
//   return new GenericYesNo(claimInterest, 'ERRORS.VALID_YES_NO_SELECTION');
// };

export const saveDelayedFlight = async (claimId: string, delayedFlight: DelayedFlight) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.delayedFlight = delayedFlight;
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
