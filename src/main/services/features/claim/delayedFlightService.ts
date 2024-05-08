import {getCaseDataFromStore, saveDraftClaim} from "modules/draft-store/draftStoreService";
import {DelayedFlight} from "common/models/delayedFlight";
import {FlightDetails} from "common/models/flightDetails";

const {Logger} = require("@hmcts/nodejs-logging");
const logger = Logger.getLogger("Claim - Claim Interest");

export const getDelayedFlight = async (claimId: string): Promise<DelayedFlight> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.delayedFlight
      ? new DelayedFlight(caseData.delayedFlight?.option)
      : new DelayedFlight();
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
          caseData.flightDetails?.year,
          caseData.flightDetails?.month,
          caseData.flightDetails?.day
        )
      : new FlightDetails();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

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
