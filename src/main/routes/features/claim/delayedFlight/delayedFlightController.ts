import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {CLAIM_DEFENDANT_PARTY_TYPE_URL, AIRLINE_DETAILS_URL} from '../../../urls';
// import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
// import {Airlines} from './airlinesList';
import {getFlightDetails, saveFlightDetails} from 'services/features/claim/delayedFlightService';
import {FlightDetails} from 'common/models/flightDetails';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';

const delayedFlightController = Router();
const delayedFlightPath = 'features/directionsQuestionnaire/delayed-flight';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

delayedFlightController.get(AIRLINE_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const delayedFlight = await getFlightDetails(claimId);
    const form = new GenericForm(delayedFlight)
    const airlines = await civilServiceClient.getAirlines(req);
    console.log('airlines: ', airlines);
    
    res.render(delayedFlightPath, {form, today: new Date(), airlines});
    } catch (error) {
    next(error);
  }
}) as RequestHandler);

delayedFlightController.post(AIRLINE_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    console.log('BODY: ', req.body);
    const userId = (<AppRequest>req).session?.user?.id;
    const airlines = await civilServiceClient.getAirlines(req);
    const {airline, flightNumber, year, month, day} = req.body;
    // const delayedFlight = new DelayedFlight();
    const flightDetails = new FlightDetails(airline, flightNumber, year, month, day);
    const form = new GenericForm(flightDetails);

    console.log('FORM: ', form);

    form.validateSync();
    if (form.hasErrors()) {
      res.render(delayedFlightPath, {form, today: new Date(), airlines});
    } else {
      // TODO: set court
      // const claimId = req.session?.user?.id;
      // const claim = await getCaseDataFromStore(claimId);
      // const flightDetails = await getFlightDetails(userId);

      // delayedFlight = new DelayedFlight();
      // delayedFlight = new DelayedFlight(option, airline, flightNumber, year, month, day);
      await saveFlightDetails(userId, flightDetails);
      res.redirect(CLAIM_DEFENDANT_PARTY_TYPE_URL);
    }
} catch (error) {
    next(error);
  }
}) as RequestHandler);

export default delayedFlightController;
