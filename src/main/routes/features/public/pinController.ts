import * as express from 'express';
import config from 'config';
import {
  FIRST_CONTACT_PIN_URL,
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_SUMMARY_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {PinType} from '../../../common/models/pin';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import {AppRequest} from '../../../common/models/AppRequest';
import {YesNo} from '../../../common/form/models/yesNo';
import {saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {AxiosResponse} from 'axios';

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

  // TODO: mock cookike claim reference number
  const cookie = req.cookies['firstContact'] ? req.cookies['firstContact'] : {};
  cookie.claimReference = '000MC000';
  res.cookie('firstContact', cookie);

  renderView(pinForm, res);
});

pinController.post(FIRST_CONTACT_PIN_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // STEP 1: call service an get claim
    const cookie = req.cookies['firstContact'] ? req.cookies['firstContact'] : {};
    const response: AxiosResponse = await civilServiceClient.verifyPin(<AppRequest>req, req.body.pin, cookie.claimReference);

    if (response.status === 401) {
      return res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
    }

    const pin = response.status === 400 ? '' : req.body.pin;
    const pinForm = new GenericForm(new PinType(pin));
    pinForm.validateSync();

    if (pinForm.hasErrors()) {
      renderView(pinForm, res);
    } else {
      // STEP 2: save claim in redis
      await saveDraftClaim(response.data.id, response.data.case_data);
      // STEP 3: save pinValidate = yes in cookies
      cookie.claimId = response.data.id;
      cookie.pinVerified = YesNo.YES;
      // STEP 4: redirect to next page
      res.redirect(FIRST_CONTACT_CLAIM_SUMMARY_URL);
    }
  } catch (error) {
    next(error);
  }

});

export default pinController;
