import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  GA_UNAVAILABILITY_CONFIRMATION_URL,
  GA_RESPONSE_VIEW_APPLICATION_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,

} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {Claim} from 'models/claim';

const emailMediationConfirmationViewPath = 'features/common/yes-no-common-page';
const gaUnavailabilityDatesConfirmationController = Router();
const MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE = 'PAGES.UNAVAILABILITY_NEXT_THREE_MONTHS_MEDIATION_CONFIRMATION.';

const renderView = async (claimId: string, claim: Claim, form: GenericForm<GenericYesNo>, res: Response, req: Request) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE}PAGE_TEXT`, {lng: lang});
  const pageHintText = t(`${MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_PAGE}PAGE_HINT_TEXT`, {lng: lang});
  const variation = {
    yes: 'COMMON.VARIATION_8.YES',
    no: 'COMMON.VARIATION_8.NO',
  };
  const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(<AppRequest>req));
  const cancelUrl = await getCancelUrl(req.params.id, claim);
  const caption: string = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
  const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONSE_VIEW_APPLICATION_URL);
  res.render(emailMediationConfirmationViewPath, {form, pageTitle, pageText, pageHintText, variation, caption, backLinkUrl, cancelUrl});
};

gaUnavailabilityDatesConfirmationController.get(GA_UNAVAILABILITY_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.hasUnavailableDatesHearing));
    await renderView(claimId, claim, form, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

gaUnavailabilityDatesConfirmationController.post(GA_UNAVAILABILITY_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {

    const claimId = req.params.id;
    const optionSelected = req.body.option;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(new GenericYesNo(optionSelected, 'ERRORS.VALID_YES_NO_OPTION_CARM_OES_NAC_OES'));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, res, req);
    } else {
      //const redisKey = generateRedisKey(<AppRequest>req);
      //const redisKey = generateRedisKey(<AppRequest>req);
      //const claimId = req.params.id;
      //const claim = await getCaseDataFromStore(redisKey);
      //const isClaimantResponse = claim.isClaimantIntentionPending();
      //const url = isClaimantResponse ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL;
      //await saveRequestingReason(redisKey, requestingReason, applicationIndex);
      //if (optionSelected === YesNo.NO){
      //  res.redirect(constructResponseUrlWithIdParams(claimId, url));
      //} else {
        res.redirect(constructResponseUrlWithIdParams(claimId, GA_UNAVAILABLE_HEARING_DATES_URL));
      //}
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default gaUnavailabilityDatesConfirmationController;
