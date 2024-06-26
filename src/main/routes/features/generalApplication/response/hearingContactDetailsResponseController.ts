import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_RESPONSE_HEARING_ARRANGEMENT_URL, GA_RESPONSE_HEARING_CONTACT_DETAILS_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getRespondToApplicationCaption,
  saveRespondentHearingContactDetails,
} from 'services/features/generalApplication/response/generalApplicationResponseService';

const hearingContactDetailsResponseController = Router();
const viewPath = 'features/generalApplication/hearing-contact-details';

async function renderView(claimId: string, claim: Claim, form: GenericForm<HearingContactDetails>, req: AppRequest | Request, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const headerTitle = getRespondToApplicationCaption(claim,lang);
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_RESPONSE_HEARING_ARRANGEMENT_URL);
  res.render(viewPath, { form, cancelUrl, backLinkUrl, headerTitle });
}

hearingContactDetailsResponseController.get(GA_RESPONSE_HEARING_CONTACT_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const hearingContactDetails = claim.generalApplication?.response?.hearingContactDetails || new HearingContactDetails();
    const form = new GenericForm(hearingContactDetails);
    await renderView(claimId, claim, form, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingContactDetailsResponseController.post(GA_RESPONSE_HEARING_CONTACT_DETAILS_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const hearingContactDetails: HearingContactDetails = new HearingContactDetails(req.body.telephoneNumber, req.body.emailAddress);
    const form = new GenericForm(hearingContactDetails);
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, req, res);
    } else {
      await saveRespondentHearingContactDetails(redisKey, hearingContactDetails);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default hearingContactDetailsResponseController;
