import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_RESPONSE_HEARING_CONTACT_DETAILS_URL,
  GA_RESPONSE_HEARING_SUPPORT_URL,
  GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
} from 'models/generalApplication/unavailableDatesGaHearing';
import {getUnavailableDatesForHearingForm} from 'services/features/generalApplication/unavailableHearingDatesService';
import {
  getRespondToApplicationCaption, getUnavailableHearingDateCaption,
  saveRespondentUnavailableDates,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {GaResponse} from 'models/generalApplication/response/gaResponse';

const unavailableHearingDatesResponseController = Router();
const viewPath = 'features/generalApplication/unavailable-dates-hearing';

async function renderView(claim: Claim, form: GenericForm<UnavailableDatesGaHearing>, gaResponse: GaResponse, req: AppRequest | Request, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const headerTitle = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
  const cancelUrl = await getCancelUrl(req.params.id, claim);
  const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, req.params.appId, GA_RESPONSE_HEARING_CONTACT_DETAILS_URL);
  const headingTitle = getUnavailableHearingDateCaption(lang);
  res.render(viewPath, { form, cancelUrl, backLinkUrl, headerTitle, headingTitle });
}

unavailableHearingDatesResponseController.get(GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const unavailableDates = gaResponse?.unavailableDatesHearing || new UnavailableDatesGaHearing();
    const form = new GenericForm(unavailableDates);
    await renderView(claim, form, gaResponse, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

unavailableHearingDatesResponseController.post(GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const action = req.body.action;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaRedisKey = generateRedisKeyForGA(<AppRequest>req);
    const gaResponse = await getDraftGARespondentResponse(gaRedisKey);
    const unavailableDatesForHearing = getUnavailableDatesForHearingForm(req.body);
    const form = new GenericForm(unavailableDatesForHearing);
    if (action === 'add_another-unavailableDates') {
      unavailableDatesForHearing.items.push(new UnavailableDatePeriodGaHearing());
      await renderView(claim, form, gaResponse, req, res);
    } else if (action?.startsWith('remove-unavailableDates')) {
      const index = action.substring('remove-unavailableDates'.length);
      unavailableDatesForHearing.items.splice(Number(index), 1);
      await renderView(claim, form, gaResponse, req, res);
    } else {
      await form.validate();
      if (form.hasErrors()) {
        await renderView(claim, form, gaResponse, req, res);
      } else {
        await saveRespondentUnavailableDates(gaRedisKey, unavailableDatesForHearing);
        res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONSE_HEARING_SUPPORT_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default unavailableHearingDatesResponseController;
