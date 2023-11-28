import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_NEXT_3_MONTHS_URL,
  MEDIATION_UNAVAILABLE_DATES_URL, RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getMediation, saveMediation} from 'services/features/response/mediation/mediationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const emailMediationConfirmationViewPath = 'features/common/yes-no-common-page';
const mediationUnavailabilityNextThreeMonthsConfirmationController = Router();
const MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE = 'PAGES.UNAVAILABILITY_NEXT_THREE_MONTHS_MEDIATION_CONFIRMATION.';

const renderView = (form: GenericForm<GenericYesNo>, res: Response, req: Request): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE}PAGE_TEXT`, {lng: lang});
  const pageHintText = t(`${MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE}PAGE_HINT_TEXT`, {lng: lang});
  res.render(emailMediationConfirmationViewPath, {form, pageTitle, pageText, pageHintText});
};

mediationUnavailabilityNextThreeMonthsConfirmationController.get(MEDIATION_NEXT_3_MONTHS_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const mediation = await getMediation(redisKey);
    const form = new GenericForm(new GenericYesNo(mediation.hasUnavailabilityNextThreeMonths?.option));
    renderView(form, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

mediationUnavailabilityNextThreeMonthsConfirmationController.post(MEDIATION_NEXT_3_MONTHS_URL, (async (req, res, next: NextFunction) => {
  try {
    const optionSelected = req.body.option;
    const form = new GenericForm(new GenericYesNo(optionSelected));
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, req);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claimId = req.params.id;
      await saveMediation(redisKey, form.model, 'hasUnavailabilityNextThreeMonths');
      if (optionSelected === YesNo.NO){
        await saveMediation(redisKey, true, 'hasAvailabilityMediationFinished');
        res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      } else {
        await saveMediation(redisKey, false, 'hasAvailabilityMediationFinished');
        res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_UNAVAILABLE_DATES_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default mediationUnavailabilityNextThreeMonthsConfirmationController;
