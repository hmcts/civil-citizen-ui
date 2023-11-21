import {NextFunction, Router, Response} from 'express';
import {
  MEDIATION_EMAIL_CONFIRMATION_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getMediation, saveMediation} from 'services/features/response/mediation/mediationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';

const emailMediationConfirmationViewPath = 'features/mediation/mediation-email-confirmation';
const emailMediationConfirmationController = Router();
const PAGES = 'PAGES.MEDIATION_EMAIL_CONFIRMATION.';

function renderView(form: GenericForm<GenericYesNo>, res: Response, lang: string): void {
  const pageTitle = `${PAGES}PAGE_TITLE`;
  //TODO add defendant email
  const pageText = t(`${PAGES}PAGE_TEXT`, {lng: lang, email: 'defendant email'});
  res.render(emailMediationConfirmationViewPath, {form, pageTitle, pageText});
}

emailMediationConfirmationController.get(MEDIATION_EMAIL_CONFIRMATION_URL, async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const mediation = await getMediation(redisKey);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm(new GenericYesNo(mediation.isMediationEmailCorrect?.option));
    renderView(form, res, lang);
  } catch (error) {
    next(error);
  }
});

emailMediationConfirmationController.post(MEDIATION_EMAIL_CONFIRMATION_URL, async (req, res, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm(new GenericYesNo(req.body.option));
    await form.validate();

    if (form.hasErrors()) {
      renderView(form, res, lang);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      await saveMediation(redisKey, form.model, 'isMediationEmailCorrect');
      if (req.body.option === YesNo.NO) {
        //TODO add the redirection when is no
      } else {
        //TODO add the redirection when is no
      }
    }
  } catch (error) {
    next(error);
  }

});

export default emailMediationConfirmationController;
