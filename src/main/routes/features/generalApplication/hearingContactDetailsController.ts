import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_HEARING_ARRANGEMENT_URL,
  GA_HEARING_CONTACT_DETAILS_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl, getDynamicHeaderForMultipleApplications, saveHearingContactDetails} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {queryParamNumber} from 'common/utils/requestUtils';

const hearingContactDetailsController = Router();
const viewPath = 'features/generalApplication/hearing-contact-details';

async function renderView(claimId: string, claim: Claim, form: GenericForm<HearingContactDetails>, res: Response, index: number): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENT_URL), index);
  const headerTitle = getDynamicHeaderForMultipleApplications(claim);
  res.render(viewPath, { form, cancelUrl, backLinkUrl, headerTitle });
}

hearingContactDetailsController.get(GA_HEARING_CONTACT_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const index  = queryParamNumber(req, 'index') || claim.generalApplication.applicationTypes.length - 1;
    const hearingContactDetails = claim.generalApplication?.hearingContactDetails || new HearingContactDetails();
    const form = new GenericForm(hearingContactDetails);
    await renderView(claimId, claim, form, res, index);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingContactDetailsController.post(GA_HEARING_CONTACT_DETAILS_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const index  = queryParamNumber(req, 'index') || claim.generalApplication.applicationTypes.length - 1;
    const hearingContactDetails: HearingContactDetails = new HearingContactDetails(req.body.telephoneNumber, req.body.emailAddress);
    const form = new GenericForm(hearingContactDetails);
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, res, index);
    } else {
      await saveHearingContactDetails(redisKey, hearingContactDetails);
      res.redirect(constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UNAVAILABLE_HEARING_DATES_URL), index));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default hearingContactDetailsController;
