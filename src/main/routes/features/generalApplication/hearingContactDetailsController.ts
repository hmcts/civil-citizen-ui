import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_HEARING_ARRANGEMENT_URL, GA_HEARING_CONTACT_DETAILS_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {getCancelUrl, saveHearingContactDetails} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const hearingContactDetailsController = Router();
const viewPath = 'features/generalApplication/hearing-contact-details';

async function renderView(claimId: string, claim: Claim, form: GenericForm<HearingContactDetails>, res: Response): Promise<void> {
  const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENT_URL);
  res.render(viewPath, { form, cancelUrl, backLinkUrl, applicationType });
}

hearingContactDetailsController.get(GA_HEARING_CONTACT_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const hearingContactDetails = claim.generalApplication?.hearingContactDetails || new HearingContactDetails();
    const form = new GenericForm(hearingContactDetails);
    await renderView(claimId, claim, form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingContactDetailsController.post(GA_HEARING_CONTACT_DETAILS_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const hearingContactDetails: HearingContactDetails = new HearingContactDetails(req.body.preferredTelephoneNumber, req.body.preferredEmailAddress);
    const form = new GenericForm(hearingContactDetails);
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, res);
    } else {
      await saveHearingContactDetails(redisKey, hearingContactDetails);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default hearingContactDetailsController;
