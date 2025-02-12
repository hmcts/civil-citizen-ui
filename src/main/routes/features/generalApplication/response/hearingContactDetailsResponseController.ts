import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_RESPONSE_HEARING_CONTACT_DETAILS_URL,
  GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {
  getRespondToApplicationCaption,
  saveRespondentHearingContactDetails,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {GaResponse} from 'models/generalApplication/response/gaResponse';

const hearingContactDetailsResponseController = Router();
const viewPath = 'features/generalApplication/hearing-contact-details';

async function renderView(claim: Claim, form: GenericForm<HearingContactDetails>, gaResponse: GaResponse, req: AppRequest | Request, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const headerTitle = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
  const cancelUrl = await getCancelUrl(req.params.id, claim);
  const backLinkUrl = BACK_URL;
  res.render(viewPath, { form, cancelUrl, backLinkUrl, headerTitle });
}

hearingContactDetailsResponseController.get(GA_RESPONSE_HEARING_CONTACT_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const hearingContactDetails = gaResponse?.hearingContactDetails || new HearingContactDetails();
    const form = new GenericForm(hearingContactDetails);
    await renderView(claim, form, gaResponse, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingContactDetailsResponseController.post(GA_RESPONSE_HEARING_CONTACT_DETAILS_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const hearingContactDetails: HearingContactDetails = new HearingContactDetails(req.body.telephoneNumber, req.body.emailAddress);
    const form = new GenericForm(hearingContactDetails);
    await form.validate();
    if (form.hasErrors()) {
      const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(<AppRequest>req));
      await renderView(claim, form, gaResponse, req, res);
    } else {
      await saveRespondentHearingContactDetails(generateRedisKeyForGA(<AppRequest>req), hearingContactDetails);
      res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default hearingContactDetailsResponseController;
