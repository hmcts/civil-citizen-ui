import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {FlightDetails} from 'common/models/flightDetails';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {AirlineList} from 'common/models/airlines/flights';
import {t} from 'i18next';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('Claim - Claim Interest');

export const getClaimFromDraft = async (req: AppRequest): Promise<Claim> => {
  const draftResult = await getDraftClaim(req);
  return draftResult?.claimResponse?.case_data
  ? Object.assign(new Claim(), draftResult.claimResponse.case_data)
    : new Claim();
};

export const getDelayedFlight = async (req: AppRequest): Promise<GenericYesNo> => {
  try {
    const caseData = await getClaimFromDraft(req)

    return caseData.delayedFlight
      ? new GenericYesNo(caseData.delayedFlight?.option)
      : new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const deleteDelayedFlight = async (req: AppRequest): Promise<void> => {
  try {
    const claim = await getClaimFromDraft(req);

    delete claim.delayedFlight;
    delete claim.flightDetails;

    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getFlightDetails = async (req: AppRequest): Promise<FlightDetails> => {
  try {
    const caseData = await getClaimFromDraft(req);

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

export const saveDelayedFlight = async (req: AppRequest, delayedFlight: GenericYesNo) => {
  try {
    const caseData = await getClaimFromDraft(req);
    caseData.delayedFlight = delayedFlight;

    await updateDraftClaim(req, caseData, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveFlightDetails = async (req: AppRequest, flightDetails: FlightDetails) => {
  try {
    const caseData = await getClaimFromDraft(req);

    caseData.flightDetails = flightDetails;

    await updateDraftClaim(req, caseData, draftId);
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
