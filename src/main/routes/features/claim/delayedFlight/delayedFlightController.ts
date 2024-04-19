import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {CLAIM_DEFENDANT_PARTY_TYPE_URL, DELAYED_FLIGHT_URL} from '../../../urls';
// import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {DelayedFlight} from 'common/models/delayedFlight';
import {Airlines} from './airlinesList';
import {getDelayedFlight, saveDelayedFlight} from 'services/features/claim/delayedFlightService';

const delayedFlightController = Router();
const delayedFlightPath = 'features/directionsQuestionnaire/delayed-flight';

delayedFlightController.get(DELAYED_FLIGHT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const delayedFlight = await getDelayedFlight(claimId);
    const form = new GenericForm(delayedFlight)
    res.render(delayedFlightPath, {form, today: new Date(), airlines: Airlines});
    } catch (error) {
    next(error);
  }
}) as RequestHandler);

delayedFlightController.post(DELAYED_FLIGHT_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    console.log('BODY: ', req.body);
    const userId = (<AppRequest>req).session?.user?.id;
    const {option, airline, flightNumber, year, month, day} = req.body;
    // const delayedFlight = new DelayedFlight();
    const delayedFlight = new DelayedFlight(option, airline, flightNumber, year, month, day);
    const form = new GenericForm(delayedFlight);

    console.log('FORM: ', form);

    form.validateSync();
    if (form.hasErrors()) {
      res.render(delayedFlightPath, {form, today: new Date(), airlines: Airlines});
    } else {
      // TODO: set court
      // const claimId = req.session?.user?.id;
      // const claim = await getCaseDataFromStore(claimId);
      const delayedFlight = await getDelayedFlight(userId);

      // delayedFlight = new DelayedFlight();
      // delayedFlight = new DelayedFlight(option, airline, flightNumber, year, month, day);
      await saveDelayedFlight(userId, delayedFlight);
      res.redirect(CLAIM_DEFENDANT_PARTY_TYPE_URL);
    }
} catch (error) {
    next(error);
  }
}) as RequestHandler);

export default delayedFlightController;
