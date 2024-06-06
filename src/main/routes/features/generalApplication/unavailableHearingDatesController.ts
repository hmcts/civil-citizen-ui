import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_HEARING_CONTACT_DETAILS_URL, GA_HEARING_SUPPORT_URL, GA_UNAVAILABLE_HEARING_DATES_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {getCancelUrl, getLast, saveUnavailableDates} from 'services/features/generalApplication/generalApplicationService';
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
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const unavailableHearingDatesController = Router();
const viewPath = 'features/generalApplication/unavailable-dates-hearing';

async function renderView(claimId: string, claim: Claim, form: GenericForm<UnavailableDatesGaHearing>, res: Response): Promise<void> {
  const applicationType = selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option];
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_HEARING_CONTACT_DETAILS_URL);
  res.render(viewPath, { form, cancelUrl, backLinkUrl, applicationType, headingTitle: t('PAGES.GENERAL_APPLICATION.UNAVAILABLE_HEARING_DATES.TITLE') });
}

unavailableHearingDatesController.get(GA_UNAVAILABLE_HEARING_DATES_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const unavailableDates = claim.generalApplication?.unavailableDatesHearing || new UnavailableDatesGaHearing();
    const form = new GenericForm(unavailableDates);
    await renderView(claimId, claim, form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

unavailableHearingDatesController.post(GA_UNAVAILABLE_HEARING_DATES_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const action = req.body.action;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const unavailableDatesForHearing = getUnavailableDatesForHearingForm(req.body);
    const form = new GenericForm(unavailableDatesForHearing);
    if (action === 'add_another-unavailableDates') {
      unavailableDatesForHearing.items.push(new UnavailableDatePeriodGaHearing());
      await renderView(claimId, claim, form, res);
    } else if (action?.startsWith('remove-unavailableDates')) {
      const index = action.substring('remove-unavailableDates'.length);
      unavailableDatesForHearing.items.splice(Number(index), 1);
      await renderView(claimId, claim, form, res);
    } else {
      await form.validate();
      if (form.hasErrors()) {
        await renderView(claimId, claim, form, res);
      } else {
        await saveUnavailableDates(redisKey, claim, unavailableDatesForHearing);
        res.redirect(constructResponseUrlWithIdParams(claimId, GA_HEARING_SUPPORT_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default unavailableHearingDatesController;
