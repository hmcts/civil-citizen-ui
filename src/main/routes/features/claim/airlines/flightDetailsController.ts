import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {CLAIMANT_COMPANY_DETAILS_URL, FLIGHT_DETAILS_URL} from '../../../urls';
import {AppRequest} from 'models/AppRequest';
import {getFlightDetails, saveFlightDetails} from 'services/features/claim/delayedFlightService';
import {FlightDetails} from 'common/models/flightDetails';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';

const flightDetailsController = Router();
const delayedFlightPath = 'features/claim/flight-details';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

flightDetailsController.get(FLIGHT_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const delayedFlight = await getFlightDetails(claimId);
    const form = new GenericForm(delayedFlight)
    const airlines = await civilServiceClient.getAirlines(req);
    console.log('airlines: ', airlines);
    console.log('delayedFlight: ', delayedFlight);
    
    res.render(delayedFlightPath, {form, today: new Date(), airlines});
    } catch (error) {
    next(error);
  }
}) as RequestHandler);

flightDetailsController.post(FLIGHT_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    console.log('BODY: ', req.body);
    const userId = (<AppRequest>req).session?.user?.id;
    const airlines = await civilServiceClient.getAirlines(req);
    const {airline, flightNumber, year, month, day} = req.body;
    const flightDetails = new FlightDetails(airline, flightNumber, year, month, day);
    const form = new GenericForm(flightDetails);

    console.log('FORM: ', form);

    form.validateSync();
    if (form.hasErrors()) {

      let hasAirlineError = false;
      if (form.hasFieldError('airline')){
        hasAirlineError = true;
      }
      // "govuk-form-group govuk-form-group--error"
      // "govuk-error-message"
      // "govuk-input govuk-!-width-one-half govuk-input--error"
    

      res.render(delayedFlightPath, {form, today: new Date(), airlines, hasAirlineError});
    } else {
      // TODO: set court
      // const claimId = req.session?.user?.id;
      // const claim = await getCaseDataFromStore(claimId);
      // const flightDetails = await getFlightDetails(userId);

      // delayedFlight = new DelayedFlight();
      // delayedFlight = new DelayedFlight(option, airline, flightNumber, year, month, day);
      await saveFlightDetails(userId, flightDetails);
      res.redirect(CLAIMANT_COMPANY_DETAILS_URL);
    }
} catch (error) {
    next(error);
  }
}) as RequestHandler);

export default flightDetailsController;
