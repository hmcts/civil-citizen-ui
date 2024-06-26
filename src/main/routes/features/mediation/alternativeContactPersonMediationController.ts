import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL,
  MEDIATION_PHONE_CONFIRMATION_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {
  getMediationCarm,
  saveMediationCarm,
} from 'services/features/response/mediation/mediationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AlternativeContactPerson} from 'form/models/mediation/alternativeContactPerson';
import {t} from 'i18next';

const alternativeContactPersonMediationViewPath = 'features/mediation/alternative-contact-person';
const alternativeContactPersonMediationController = Router();
const MEDIATION_CONTACT_PERSON_CONFIRMATION_PAGE = 'PAGES.MEDIATION_ALTERNATIVE_CONTACT_PERSON.';
const MEDIATION_PROPERTY_NAME = 'alternativeMediationContactPerson';

const renderView = (form: GenericForm<AlternativeContactPerson>, res: Response, req: Request): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_CONTACT_PERSON_CONFIRMATION_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_CONTACT_PERSON_CONFIRMATION_PAGE}PAGE_TEXT`, {lng: lang});
  res.render(alternativeContactPersonMediationViewPath, {form, pageTitle, pageText});
};

alternativeContactPersonMediationController.get(MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const mediation = await getMediationCarm(redisKey);
    const form = new GenericForm(mediation.alternativeMediationContactPerson);
    renderView(form, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

alternativeContactPersonMediationController.post(MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL, (async (req, res, next: NextFunction) => {
  try {

    const form = new GenericForm(new AlternativeContactPerson(req.body.alternativeContactPerson));
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, req);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claimId = req.params.id;
      await saveMediationCarm(redisKey, form.model, MEDIATION_PROPERTY_NAME);
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default alternativeContactPersonMediationController;
