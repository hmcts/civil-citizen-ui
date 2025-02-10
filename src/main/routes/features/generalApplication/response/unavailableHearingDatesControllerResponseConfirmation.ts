import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  constructResponseUrlWithIdAndAppIdParams,
} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {
  getCancelUrl,
} from 'services/features/generalApplication/generalApplicationService';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {
  BACK_URL,
  GA_RESPONSE_HEARING_SUPPORT_URL, GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL,
  GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL,
} from 'routes/urls';
import {
  getRespondToApplicationCaption,
  saveResponseUnavailabilityDatesConfirmation,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {GaResponse} from 'models/generalApplication/response/gaResponse';

const viewPath = 'features/generalApplication/unavailable-dates-confirmation.njk';
const gaUnavailabilityDatesResponseConfirmationController = Router();

const renderView = async (claimId: string, gaResponse: GaResponse, claim: Claim, form: GenericForm<GenericYesNo>, res: Response, req: Request, lng: string) => {

  const cancelUrl = await getCancelUrl(req.params.id, claim);
  const backLinkUrl = BACK_URL;
  res.render(viewPath, {
    form,
    backLinkUrl,
    cancelUrl,
    headerTitle: getRespondToApplicationCaption(gaResponse.generalApplicationType, lng),
  });
};

gaUnavailabilityDatesResponseConfirmationController.get(GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const gaRedisKey = generateRedisKeyForGA(<AppRequest>req);
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(gaRedisKey);

    const form = new GenericForm(new GenericYesNo(gaResponse?.hasUnavailableDatesHearing));
    await renderView(claimId, gaResponse,claim, form, res, req, lng);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

gaUnavailabilityDatesResponseConfirmationController.post(GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const optionSelected = req.body.option;
    const gaRedisKey = generateRedisKeyForGA(<AppRequest>req);
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(gaRedisKey);
    const form = new GenericForm(new GenericYesNo(optionSelected, 'ERRORS.GENERAL_APPLICATION.ERROR_UNAVAILABLE_DATE_CONFIRMATION'));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, gaResponse, claim, form, res, req, lng);
    } else {
      let redirectUrl;
      if (optionSelected === YesNo.NO){
        redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONSE_HEARING_SUPPORT_URL);
      } else {
        redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL);
      }
      await saveResponseUnavailabilityDatesConfirmation(gaRedisKey, optionSelected);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default gaUnavailabilityDatesResponseConfirmationController;
