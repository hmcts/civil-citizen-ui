import * as express from 'express';
import config from 'config';
import {
  FIRST_CONTACT_PIN_URL,
  // FIRST_CONTACT_CLAIM_SUMMARY_URL,
} from '../../urls';
import { GenericForm } from '../../../common/form/models/genericForm';
import { PinType } from '../../../common/models/pin';
import { CivilServiceClient } from '../../../app/client/civilServiceClient';
import { Claim } from '../../../common/models/claim';
import { AppRequest } from '../../../common/models/AppRequest';

const pinController = express.Router();
const pinViewPath = 'features/public/firstContact/pin';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderView(pinForm: GenericForm<PinType>, res: express.Response): void {
  const form = Object.assign(pinForm);
  form.option = pinForm.model.pin;
  res.render(pinViewPath, { form });
}

pinController.get(FIRST_CONTACT_PIN_URL, (req: express.Request, res: express.Response) => {
  const pinForm = new GenericForm(new PinType(req.body.pin));
  renderView(pinForm, res);
});

pinController.post(FIRST_CONTACT_PIN_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const pinForm = new GenericForm(new PinType(req.body.pin));
    pinForm.validateSync();
    if (pinForm.hasErrors()) {
      renderView(pinForm, res);
    } else {
      const cookie = req.cookies['firstContact'] ? req.cookies['firstContact'] : {};
      console.log(cookie);
      // TODO:
      // STEP 1: call service an get claim
      const claim: Claim = await civilServiceClient.verifyPin(<AppRequest>req, req.body.pin);
      console.log(claim);
      // STEP 2: save claim in redis
      // STEP 3: redirect to next page
      // res.redirect(FIRST_CONTACT_CLAIM_SUMMARY_URL)
    }
  } catch (error) {
    next(error);
  }

});

export default pinController;
