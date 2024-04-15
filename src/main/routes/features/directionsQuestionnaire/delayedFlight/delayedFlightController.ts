import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {CLAIM_DEFENDANT_PARTY_TYPE_URL, DQ_DELAYED_FLIGHT_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  getDirectionQuestionnaire,
  // saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {DelayedFlight} from 'common/models/directionsQuestionnaire/delayedFlight';
import { Airlines } from './airlinesList';

const delayedFlightController = Router();
const delayedFlightPath = 'features/directionsQuestionnaire/delayed-flight';

delayedFlightController.get(DQ_DELAYED_FLIGHT_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const delayedFlight = directionQuestionnaire.delayedFlight ? directionQuestionnaire.delayedFlight : new DelayedFlight();
    const form = new GenericForm(delayedFlight)
    res.render(delayedFlightPath, {form, today: new Date(), airlines: Airlines});
    } catch (error) {
    next(error);
  }
}) as RequestHandler);

delayedFlightController.post(DQ_DELAYED_FLIGHT_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('BODY: ', req.body);

    const {option, airline, flightNumber, year, month, day} = req.body;
    const delayedFlight = new DelayedFlight(option, airline, flightNumber, year, month, day);
    const form = new GenericForm(delayedFlight);

    console.log('FORM: ', form);

    form.validateSync();
    if (form.hasErrors()) {
      res.render(delayedFlightPath, {form});
    } else {
      // TODO: set court
      const claimId = req.params.id;
      const claim = await getCaseDataFromStore(claimId);
      claim.directionQuestionnaire.delayedFlight = new DelayedFlight(day, month, year);
      // await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), form.model, 'dqPropertyName', 'delayedFlight');
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_DEFENDANT_PARTY_TYPE_URL));
    }
} catch (error) {
    next(error);
  }
}) as RequestHandler);


// delayedFlightController.post(DQ_DELAYED_FLIGHT_URL,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const form: GenericForm<DelayedFlight> = new GenericForm(new DelayedFlight(req.body.option, getOtherWitnessDetailsForm(req)));
//       form.validateSync();
//       if (form.hasErrors()) {
//         res.render(delayedFlightPath, {form});
//       } else {
//         await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), form.model, dqPropertyName, dqParentName);
//         res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_DEFENDANT_PARTY_TYPE_URL));
//       }
//     } catch (error) {
//       next(error);
//     }
//   }) as RequestHandler);

export default delayedFlightController;
