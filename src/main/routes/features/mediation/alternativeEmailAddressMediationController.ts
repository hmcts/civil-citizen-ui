import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_ALTERNATIVE_EMAIL_URL,
  MEDIATION_NEXT_3_MONTHS_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {
  getMediationCarm,
  saveMediationCarm,
} from 'services/features/response/mediation/mediationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AlternativeEmailAddress} from 'form/models/mediation/AlternativeEmailAddress';

const alternativeEmailAddressMediationViewPath = 'features/mediation/alternative-email';
const alternativeEmailAddressMediationController = Router();
const MEDIATION_EMAIL_CONFIRMATION_PAGE = 'PAGES.MEDIATION_ALTERNATIVE_EMAIL.';
const MEDIATION_PROPERTY_NAME = 'alternativeMediationEmail';

const renderView = (form: GenericForm<AlternativeEmailAddress>, res: Response, req: Request): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TEXT`, {lng: lang});
  res.render(alternativeEmailAddressMediationViewPath, {form, pageTitle, pageText});
};

alternativeEmailAddressMediationController.get(MEDIATION_ALTERNATIVE_EMAIL_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const mediation = await getMediationCarm(redisKey);
    const form = new GenericForm(mediation.alternativeMediationEmail);
    renderView(form, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

alternativeEmailAddressMediationController.post(MEDIATION_ALTERNATIVE_EMAIL_URL, (async (req, res, next: NextFunction) => {
  try {

    const form = new GenericForm(new AlternativeEmailAddress(req.body.alternativeEmailAddress));
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, req);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claimId = req.params.id;
      await saveMediationCarm(redisKey, form.model, MEDIATION_PROPERTY_NAME);
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default alternativeEmailAddressMediationController;
