import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {CLAIM_DEFENDANT_COMPANY_DETAILS_URL, DELAYED_FLIGHT_URL, FLIGHT_DETAILS_URL} from '../../../urls';
import {AppRequest} from 'models/AppRequest';
import {getDelayedFlight, saveDelayedFlight} from 'services/features/claim/delayedFlightService';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {YesNo} from 'common/form/models/yesNo';

const delayedFlightController = Router();
const delayedFlightPath = 'features/claim/airlines/delayed-flight';
const pageTitle = 'PAGES.DELAYED_FLIGHT.CLAIMING_FOR_DELAYED';

delayedFlightController.get(DELAYED_FLIGHT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const delayedFlight = await getDelayedFlight(userId);
    const form = new GenericForm(delayedFlight);
    res.render(delayedFlightPath, {form, pageTitle});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

delayedFlightController.post(DELAYED_FLIGHT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const delayedFlight = new GenericYesNo(req.body.option, 'ERRORS.DELAYED_FLIGHT.CLAIMING_FOR_DELAY_REQUIRED');
    const form = new GenericForm(delayedFlight);
    form.validateSync();

    if (form.hasErrors()) {
      res.render(delayedFlightPath, {form, pageTitle});
    } else {
      await saveDelayedFlight(userId, delayedFlight);

      delayedFlight.option === YesNo.YES
        ? res.redirect(FLIGHT_DETAILS_URL)
        : res.redirect(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default delayedFlightController;
