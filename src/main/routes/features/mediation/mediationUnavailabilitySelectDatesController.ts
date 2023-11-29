import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_UNAVAILABLE_SELECT_DATES_URL, RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {getMediation, saveMediation} from 'services/features/response/mediation/mediationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {UnavailableDates} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {getUnavailableDatesMediationForm} from 'services/features/mediation/unavailableDatesForMediationService';

const emailMediationConfirmationViewPath = 'features/mediation/unavailable-dates-mediation';
const mediationUnavailabilitySelectDatesController = Router();
const MEDIATION_UNAVAILABILITY_SELECT_DATES_PAGE = 'PAGES.UNAVAILABILITY_SELECT_DATES_MEDIATION.';

const renderView = (form: GenericForm<UnavailableDates>, res: Response, req: Request): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_UNAVAILABILITY_SELECT_DATES_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_UNAVAILABILITY_SELECT_DATES_PAGE}PAGE_TEXT`, {lng: lang});
  const pageHint = {
    text1: t(`${MEDIATION_UNAVAILABILITY_SELECT_DATES_PAGE}PAGE_HINT_TEXT1`, {lng: lang}),
    text2: t(`${MEDIATION_UNAVAILABILITY_SELECT_DATES_PAGE}PAGE_HINT_TEXT2`, {lng: lang}),
  };
  res.render(emailMediationConfirmationViewPath, {form, pageTitle, pageText, pageHint});
};

mediationUnavailabilitySelectDatesController.get(MEDIATION_UNAVAILABLE_SELECT_DATES_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const mediation = await getMediation(redisKey);
    const form = new GenericForm(mediation.unavailableDatesForMediation);
    renderView(form, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

mediationUnavailabilitySelectDatesController.post(MEDIATION_UNAVAILABLE_SELECT_DATES_URL, (async (req, res, next: NextFunction) => {
  try {
    const unavailableDatesForMediation = getUnavailableDatesMediationForm(req.body);
    const form = new GenericForm(unavailableDatesForMediation);
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, req);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claimId = req.params.id;
      await saveMediation(redisKey, form.model, 'unavailableDatesForMediation');
      await saveMediation(redisKey, true, 'hasAvailabilityMediationFinished');
      res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default mediationUnavailabilitySelectDatesController;
