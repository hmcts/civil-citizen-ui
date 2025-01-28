import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {FIRST_CONTACT_ACCESS_DENIED_URL, FIRST_CONTACT_CLAIM_SUMMARY_URL, FIRST_CONTACT_PIN_URL} from '../../../urls';
import {GenericForm} from 'form/models/genericForm';
import {PinType} from 'models/firstContact/pin';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest, AppSession} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {getFirstContactData, saveFirstContactData} from 'services/firstcontact/firstcontactService';

const CryptoJS = require('crypto-js');

const pinController = Router();
const pinViewPath = 'features/public/firstContact/pin';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderView(pinForm: GenericForm<PinType>, isPinEmpty: boolean, res: Response, isLRDefendant?: boolean): void {
  const form = Object.assign(pinForm);
  form.option = pinForm.model.pin;
  form.isPinEmpty = isPinEmpty;
  form.isLRDefendant = isLRDefendant;
  res.render(pinViewPath, { form });
}

pinController.get(FIRST_CONTACT_PIN_URL, (req: AppRequest<{pin:string}>, res: Response) => {
  const pinForm = new GenericForm(new PinType(req.body.pin));
  renderView(pinForm, false, res);
});

pinController.post(FIRST_CONTACT_PIN_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firstContact = getFirstContactData(req.session as AppSession);
    const pin = req.body.pin;
    const pinForm = new GenericForm(new PinType(pin));
    await pinForm.validate();
    if (pinForm.hasErrors()) {
      renderView(pinForm, !!req.body.pin, res);
    } else {
      const pin = pinForm.model.pin;
      if (pin.length === 8 && firstContact?.claimReference) {
        const redirectUrl: string = await civilServiceClient.verifyOcmcPin(pin, firstContact?.claimReference);
        console.log('RedirectUrl : ', redirectUrl);
        res.redirect(redirectUrl);
      } else if (firstContact?.claimReference) {
        const claim: Claim = await civilServiceClient.verifyPin(<AppRequest>req, pin, firstContact?.claimReference);
        if (claim.isLiPvLRClaim()) {
          const pinForm = new GenericForm(new PinType());
          await pinForm.validate();
          pinForm.errors = undefined;
          renderView(pinForm, false, res, true);
        } else {
          await saveDraftClaim(claim.id, claim, true);
          const ciphertext = CryptoJS.AES.encrypt(YesNo.YES, pin).toString();
          req.session = saveFirstContactData(req.session as AppSession, {claimId: claim.id, pin: ciphertext});
          res.redirect(FIRST_CONTACT_CLAIM_SUMMARY_URL);
        }
      }
    }
  } catch (error) {
    const status = error.message;
    if(status.includes('400')) {
      const pinForm = new GenericForm(new PinType(''));
      await pinForm.validate();
      renderView(pinForm, !!req.body.pin, res);
    } else if(status.includes('401')){
      return res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
    }else{
      next(error);
    }
  }
}) as RequestHandler);

export default pinController;
