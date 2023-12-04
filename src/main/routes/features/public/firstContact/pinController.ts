import {NextFunction, Request, Response, Router} from 'express';
import config from 'config';
import {
  FIRST_CONTACT_PIN_URL,
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_SUMMARY_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {PinType} from '../../../../common/models/firstContact/pin';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {AppRequest} from '../../../../common/models/AppRequest';
import {YesNo} from '../../../../common/form/models/yesNo';
import {saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../../common/models/claim';

const CryptoJS = require('crypto-js');

const pinController = Router();
const pinViewPath = 'features/public/firstContact/pin';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderView(pinForm: GenericForm<PinType>, isPinEmpty: boolean, res: Response): void {
  const form = Object.assign(pinForm);
  form.option = pinForm.model.pin;
  form.isPinEmpty = isPinEmpty;
  res.render(pinViewPath, { form });
}

pinController.get(FIRST_CONTACT_PIN_URL, (req: AppRequest<{pin:string}>, res: Response) => {
  const pinForm = new GenericForm(new PinType(req.body.pin));
  renderView(pinForm, false, res);
});

pinController.post(FIRST_CONTACT_PIN_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies['firstContact'] ? req.cookies['firstContact'] : {};
    const pin = req.body.pin;
    const pinForm = new GenericForm(new PinType(pin));
    await pinForm.validate();
    const claimReferenceNumber = cookie.claimReference;
    if (pinForm.hasErrors()) {
      renderView(pinForm, !!req.body.pin, res);
    } else {
      const pin = pinForm.model.pin;
      if (pin.length === 8) {
        console.log('Its OCMC claim');
        res.redirect(verifyPin(claimReferenceNumber));
      } else {
        const claim: Claim = await civilServiceClient.verifyPin(<AppRequest>req, pin, claimReferenceNumber);
        await saveDraftClaim(claim.id, claim, true);
        cookie.claimId = claim.id;
        const ciphertext = CryptoJS.AES.encrypt(YesNo.YES, pin).toString();
        cookie.AdGfst2UUAB7szHPkzojWkbaaBHtEIXBETUQ = ciphertext;
        res.cookie('firstContact', cookie);
        res.redirect(FIRST_CONTACT_CLAIM_SUMMARY_URL);
      }
    }
  } catch (error) {
    const status = error.message;
    if(status.includes('400')) {
      const pinForm = new GenericForm(new PinType(''));
      await pinForm.validate();
      renderView(pinForm, !!req.body.pin, res);
    }else if(status.includes('401')){
      return res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
    }else{
      next(error);
    }
  }
});

function verifyPin(claimReferenceNumber: string): string {
  const redirectUri =  config.get<string>('services.cmc.url') + '/receiver';
  console.log('RedirectUrl : ', redirectUri);
  //const loginPath =  config.get<string>('services.idam.idamPinUrl');
  const loginPath = 'https://idam-api.aat.platform.hmcts.net/pin';
  console.log('RedirectUrl : ', loginPath);
  const clientId = 'cmc_citizen';

  return `${loginPath}?response_type=code&state=${claimReferenceNumber}&client_id=${clientId}&redirect_uri=${redirectUri}`;

}

export default pinController;
