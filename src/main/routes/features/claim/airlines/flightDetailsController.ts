import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {CLAIM_DEFENDANT_COMPANY_DETAILS_URL, FLIGHT_DETAILS_URL} from '../../../urls';
import {AppRequest} from 'models/AppRequest';
import {getFlightDetails, saveFlightDetails} from 'services/features/claim/delayedFlightService';
import {FlightDetails} from 'common/models/flightDetails';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {t} from 'i18next';
import {AirlineList} from 'common/models/airlines/flights';

const flightDetailsController = Router();
const flightDetailsPath = 'features/claim/airlines/flight-details';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

flightDetailsController.get(FLIGHT_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.session?.user?.id;
    const flightDetails = await getFlightDetails(claimId);
    const form = new GenericForm(flightDetails);
    const airlines = await civilServiceClient.getAirlines(req);
    const datalist = buildDataList(airlines, form.hasFieldError('airline'), flightDetails.airline, lng);
    res.render(flightDetailsPath, {form, today: new Date(), airlines, datalist});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

flightDetailsController.post(FLIGHT_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const userId = (<AppRequest>req).session?.user?.id;
    const airlines: AirlineList[] = await civilServiceClient.getAirlines(req);
    const {airline, flightNumber, year, month, day} = req.body;
    const flightDetails = new FlightDetails(airline, flightNumber, year, month, day);
    const form = new GenericForm(flightDetails);

    form.validateSync();
    if (form.hasErrors()) {
      const datalist = buildDataList(airlines, form.hasFieldError('airline'), airline, lng);
      res.render(flightDetailsPath, {form, today: new Date(), airlines, datalist});
    } else {
      await saveFlightDetails(userId, flightDetails);
      res.redirect(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const buildDataList = (airlines: AirlineList[] = [], hasAirlineError: boolean, selection = '', lng: string) => {
  let options = '';
  airlines = airlines.filter(item => item.airline !== 'OTHER');
  airlines.forEach((airline) => {
    options += `<option value="${airline.airline}"> `;
  });

  return `
    <div class="${hasAirlineError ? 'govuk-form-group--error govuk-!-margin-bottom-6' : 'govuk-form-group'}">
      <p class="govuk-body govuk-!-margin-bottom-1">${t('PAGES.FLIGHT_DETAILS.AIRLINE', { lng })}</p>
      <p class="${hasAirlineError ? 'govuk-error-message' : 'govuk-visually-hidden'}">${t('ERRORS.FLIGHT_DETAILS.AIRLINE_REQUIRED', { lng })}</p>
      <input list="airlines" name="airline" id="airline" value="${selection}" class="${hasAirlineError ? 'govuk-input govuk-!-width-one-half govuk-input--error' : 'govuk-input govuk-!-width-one-half'}">
      <datalist id="airlines" class="govuk-!-padding-bottom-0">
        ${options}
      </datalist>
    </div>`;
};

export default flightDetailsController;
