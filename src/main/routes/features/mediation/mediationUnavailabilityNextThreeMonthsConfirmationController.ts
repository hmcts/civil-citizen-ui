import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  MEDIATION_NEXT_3_MONTHS_URL,
  MEDIATION_UNAVAILABLE_SELECT_DATES_URL, RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  getMediationCarm,
  saveMediationCarm,
} from 'services/features/response/mediation/mediationService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNoCarmIeNeuNa} from 'form/models/genericYesNoCarmIeNeuNa';

const emailMediationConfirmationViewPath = 'features/common/yes-no-common-page';
const mediationUnavailabilityNextThreeMonthsConfirmationController = Router();
const MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE = 'PAGES.UNAVAILABILITY_NEXT_THREE_MONTHS_MEDIATION_CONFIRMATION.';

const renderView = (form: GenericForm<GenericYesNo>, res: Response, req: Request): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE}PAGE_TEXT`, {lng: lang});
  const pageHintText = t(`${MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE}PAGE_HINT_TEXT`, {lng: lang});
  const variation = {
    yes : 'COMMON.VARIATION_7.YES',
    no: 'COMMON.VARIATION_7.NO',
  };
  res.render(emailMediationConfirmationViewPath, {form, pageTitle, pageText, pageHintText, variation});
};

mediationUnavailabilityNextThreeMonthsConfirmationController.get(MEDIATION_NEXT_3_MONTHS_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const mediation = await getMediationCarm(redisKey);
    const form = new GenericForm(new GenericYesNoCarmIeNeuNa(mediation.hasUnavailabilityNextThreeMonths?.option));
    renderView(form, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

mediationUnavailabilityNextThreeMonthsConfirmationController.post(MEDIATION_NEXT_3_MONTHS_URL, (async (req, res, next: NextFunction) => {
  try {
    const optionSelected = req.body.option;
    const form = new GenericForm(new GenericYesNo(optionSelected, 'ERRORS.VALID_YES_NO_OPTION_CARM_OES_NAC_OES'));
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, req);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claimId = req.params.id;
      const claim = await getCaseDataFromStore(redisKey);
      const isClaimantResponse = claim.isClaimantIntentionPending();
      const url = isClaimantResponse ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL;
      await saveMediationCarm(redisKey, form.model, 'hasUnavailabilityNextThreeMonths');
      if (optionSelected === YesNo.NO){
        await saveMediationCarm(redisKey, true, 'hasAvailabilityMediationFinished');
        res.redirect(constructResponseUrlWithIdParams(claimId, url));
      } else {
        await saveMediationCarm(redisKey, false, 'hasAvailabilityMediationFinished');
        res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_UNAVAILABLE_SELECT_DATES_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default mediationUnavailabilityNextThreeMonthsConfirmationController;
