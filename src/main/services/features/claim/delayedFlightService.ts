import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {FlightDetails} from 'common/models/flightDetails';
import {GenericYesNo} from 'common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('Claim - Claim Interest');

export const getDelayedFlight = async (claimId: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.delayedFlight
      ? new GenericYesNo(caseData.delayedFlight?.option)
      : new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const deleteDelayedFlight = async (claimId: string): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    delete claim.delayedFlight;
    delete claim.flightDetails;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getFlightDetails = async (claimId: string): Promise<FlightDetails> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.flightDetails
      ? new FlightDetails(
        caseData.flightDetails?.airline,
        caseData.flightDetails?.flightNumber,
        caseData.flightDetails?.year.toString(),
        caseData.flightDetails?.month.toString(),
        caseData.flightDetails?.day.toString(),
      )
      : new FlightDetails();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveDelayedFlight = async (claimId: string, delayedFlight: GenericYesNo) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.delayedFlight = delayedFlight;
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveFlightDetails = async (claimId: string, flightDetails: FlightDetails) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.flightDetails = flightDetails;
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
