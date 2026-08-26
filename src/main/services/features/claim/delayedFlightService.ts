import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {FlightDetails} from 'common/models/flightDetails';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {AirlineList} from 'common/models/airlines/flights';
import {t} from 'i18next';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('delayedFlightService');

export const getDelayedFlight = async (req: AppRequest): Promise<GenericYesNo> => {
  try {
    const {claim} = await loadClaim(req);
    return claim.delayedFlight
      ? new GenericYesNo(claim.delayedFlight?.option)
      : new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const deleteDelayedFlight = async (req: AppRequest): Promise<void> => {
  try {
    const {claim, draftId, createdAt} = await loadClaim(req);
    delete claim.delayedFlight;
    delete claim.flightDetails;
    await updateClaim(req, claim, draftId, createdAt);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getFlightDetails = async (req: AppRequest): Promise<FlightDetails> => {
  try {
    const {claim} = await loadClaim(req);
    return claim.flightDetails
      ? new FlightDetails(
        claim.flightDetails?.airline,
        claim.flightDetails?.flightNumber,
        claim.flightDetails?.year.toString(),
        claim.flightDetails?.month.toString(),
        claim.flightDetails?.day.toString(),
      )
      : new FlightDetails();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveDelayedFlight = async (req: AppRequest, delayedFlight: GenericYesNo) => {
  try {
    const {claim, draftId, createdAt} = await loadClaim(req);
    claim.delayedFlight = delayedFlight;
    await updateClaim(req, claim, draftId, createdAt);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveFlightDetails = async (req: AppRequest, flightDetails: FlightDetails) => {
  try {
    const {claim, draftId, createdAt} = await loadClaim(req);
    claim.flightDetails = flightDetails;
    await updateClaim(req, claim, draftId, createdAt);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const buildDataList = (airlines: AirlineList[] = [], hasAirlineError: boolean, selection = '', lng: string) => {
  let options = '';
  airlines
    .filter(item => item.airline !== 'OTHER')
    .forEach((airline) => {
      options += `<option value="${airline.airline}"> `;
    });

  return `
    <div class="${hasAirlineError ? 'govuk-form-group--error govuk-!-margin-bottom-6' : 'govuk-form-group'}">
      <p class="govuk-body govuk-!-margin-bottom-1">${t('PAGES.FLIGHT_DETAILS.AIRLINE', { lng })}</p>
      <p class="${hasAirlineError ? 'govuk-error-message' : 'govuk-visually-hidden'}">${t('ERRORS.FLIGHT_DETAILS.AIRLINE_REQUIRED', { lng })}</p>
      <input list="airlines" name="airline" id="airline" value="${selection}" aria-label="airline list" class="${hasAirlineError ? 'govuk-input govuk-!-width-one-half govuk-input--error' : 'govuk-input govuk-!-width-one-half'}">
      <datalist id="airlines" class="govuk-!-padding-bottom-0">
        ${options}
      </datalist>
    </div>`;
};

const loadClaim = async (req: AppRequest) => {
  const draftResult = await getDraftClaim(req);
  if (!draftResult) {
    throw new Error('[delayedFlightService] no draft claim found');
  }
  const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
  const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
  return {claim, draftId, createdAt: draftResult.createdAt};
};

const updateClaim = async (req: AppRequest, claim: Claim, draftId: string, createdAt?: string) => {
  if (createdAt && !claim.draftClaimCreatedAt) {
    claim.draftClaimCreatedAt = new Date(createdAt);
  }
  await updateDraftClaim(req, claim, draftId);
};
