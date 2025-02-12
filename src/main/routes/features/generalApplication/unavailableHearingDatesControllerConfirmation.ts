import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  GA_UNAVAILABILITY_CONFIRMATION_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,
  GA_HEARING_SUPPORT_URL, BACK_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  constructResponseUrlWithIdParams,
  constructUrlWithIndex,
} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {
  getCancelUrl,
  getDynamicHeaderForMultipleApplications,
  saveUnavailabilityDatesConfirmation,
} from 'services/features/generalApplication/generalApplicationService';
import {Claim} from 'models/claim';
import {queryParamNumber} from 'common/utils/requestUtils';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const viewPath = 'features/generalApplication/unavailable-dates-confirmation.njk';
const gaUnavailabilityDatesConfirmationController = Router();

const renderView = async (claimId: string, claim: Claim, form: GenericForm<GenericYesNo>, res: Response, req: Request, index: number) => {
  const cancelUrl = await getCancelUrl(req.params.id, claim);
  const backLinkUrl = BACK_URL;
  res.render(viewPath, {
    form,
    backLinkUrl,
    cancelUrl,
    headerTitle: getDynamicHeaderForMultipleApplications(claim),
    index});
};

gaUnavailabilityDatesConfirmationController.get(GA_UNAVAILABILITY_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const index  = queryParamNumber(req, 'index') || claim.generalApplication.applicationTypes.length - 1;
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.hasUnavailableDatesHearing));
    await renderView(claimId, claim, form, res, req, index);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

gaUnavailabilityDatesConfirmationController.post(GA_UNAVAILABILITY_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const optionSelected = req.body.option;
    const claim = await getClaimById(claimId, req, true);
    const index  = queryParamNumber(req, 'index') || claim.generalApplication.applicationTypes.length - 1;
    const form = new GenericForm(new GenericYesNo(optionSelected, 'ERRORS.GENERAL_APPLICATION.ERROR_UNAVAILABLE_DATE_CONFIRMATION'));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, res, req, index);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      let redirectUrl;
      if (optionSelected === YesNo.NO){
        redirectUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_SUPPORT_URL), index);
      } else {
        redirectUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UNAVAILABLE_HEARING_DATES_URL), index);
      }
      await saveUnavailabilityDatesConfirmation(redisKey, optionSelected);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default gaUnavailabilityDatesConfirmationController;
