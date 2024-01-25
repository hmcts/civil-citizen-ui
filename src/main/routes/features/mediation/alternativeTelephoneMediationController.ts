import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_ALTERNATIVE_PHONE_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {
  getMediationCarm,
  saveMediationCarm
} from 'services/features/response/mediation/mediationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AlternativeTelephone} from 'form/models/mediation/AlternativeTelephone';

const alternativeTelephoneMediationViewPath = 'features/mediation/alternative-telephone';
const alternativeTelephoneMediationController = Router();
const MEDIATION_EMAIL_CONFIRMATION_PAGE = 'PAGES.MEDIATION_ALTERNATIVE_TELEPHONE.';
const MEDIATION_PROPERTY_NAME = 'alternativeMediationTelephone';

const renderView = (form: GenericForm<AlternativeTelephone>, res: Response, req: Request): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TEXT`, {lng: lang});
  res.render(alternativeTelephoneMediationViewPath, {form, pageTitle, pageText});
};

alternativeTelephoneMediationController.get(MEDIATION_ALTERNATIVE_PHONE_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const mediation = await getMediationCarm(redisKey);
    const form = new GenericForm(mediation.alternativeMediationTelephone);
    renderView(form, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

alternativeTelephoneMediationController.post(MEDIATION_ALTERNATIVE_PHONE_URL, (async (req, res, next: NextFunction) => {
  try {

    const form = new GenericForm(new AlternativeTelephone(req.body.alternativeTelephone));
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, req);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claimId = req.params.id;
      await saveMediationCarm(redisKey, form.model, MEDIATION_PROPERTY_NAME);
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_EMAIL_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default alternativeTelephoneMediationController;
