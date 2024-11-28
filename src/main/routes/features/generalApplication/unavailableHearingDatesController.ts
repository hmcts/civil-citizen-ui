import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_HEARING_SUPPORT_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl, getDynamicHeaderForMultipleApplications, saveUnavailableDates} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
} from 'models/generalApplication/unavailableDatesGaHearing';
import {
  getUnavailableDatesForHearingForm,
} from 'services/features/generalApplication/unavailableHearingDatesService';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {queryParamNumber} from 'common/utils/requestUtils';

const unavailableHearingDatesController = Router();
const viewPath = 'features/generalApplication/unavailable-dates-hearing';

async function renderView(claimId: string, claim: Claim, form: GenericForm<UnavailableDatesGaHearing>, res: Response, cancelUrl: string, lng: string, index: number): Promise<void> {
  const backLinkUrl = BACK_URL;
  res.render(viewPath, { form, cancelUrl, backLinkUrl,
    headerTitle: getDynamicHeaderForMultipleApplications(claim),
    headingTitle: t('PAGES.GENERAL_APPLICATION.UNAVAILABLE_HEARING_DATES.TITLE', {lng}) });
}

unavailableHearingDatesController.get(GA_UNAVAILABLE_HEARING_DATES_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const index  = queryParamNumber(req, 'index') || (claim.generalApplication?.applicationTypes?.length - 1 || 0);
    const unavailableDates = claim.generalApplication?.unavailableDatesHearing || new UnavailableDatesGaHearing();
    const form = new GenericForm(unavailableDates);
    const cancelUrl = await getCancelUrl(claimId, claim);
    await renderView(claimId, claim, form, res, cancelUrl, lng, index);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

unavailableHearingDatesController.post(GA_UNAVAILABLE_HEARING_DATES_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const action = req.body.action;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const index  = queryParamNumber(req, 'index') || (claim.generalApplication?.applicationTypes?.length - 1 || 0);
    const unavailableDatesForHearing = getUnavailableDatesForHearingForm(req.body);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const form = new GenericForm(unavailableDatesForHearing);
    if (action === 'add_another-unavailableDates') {
      unavailableDatesForHearing.items.push(new UnavailableDatePeriodGaHearing());
      await renderView(claimId, claim, form, res, cancelUrl, lng, index);
    } else if (action?.startsWith('remove-unavailableDates')) {
      const index = action.substring('remove-unavailableDates'.length);
      unavailableDatesForHearing.items.splice(Number(index), 1);
      await renderView(claimId, claim, form, res, cancelUrl, lng, index);
    } else {
      await form.validate();
      if (form.hasErrors()) {
        await renderView(claimId, claim, form, res, cancelUrl, lng, index);
      } else {
        await saveUnavailableDates(redisKey, claim, unavailableDatesForHearing);

        res.redirect(constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_SUPPORT_URL), index));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default unavailableHearingDatesController;
