import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_RESPONSE_HEARING_ARRANGEMENT_URL,
  GA_RESPONSE_HEARING_CONTACT_DETAILS_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {getListOfCourtLocations} from 'services/features/directionsQuestionnaire/hearing/specificCourtLocationService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {
  getRespondToApplicationCaption,
  saveRespondentHearingArrangement,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {GaResponse} from 'models/generalApplication/response/gaResponse';

const hearingArrangementResponseController = Router();
const viewPath = 'features/generalApplication/hearing-arrangement';

async function renderView(gaResponse: GaResponse, claim: Claim, form: GenericForm<HearingArrangement>, req: AppRequest | Request, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const headerTitle = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
  const cancelUrl = await getCancelUrl(req.params.id, claim);
  const courtLocations = await getListOfCourtLocations(<AppRequest> req);
  const backLinkUrl = BACK_URL;

  res.render(viewPath, { form, cancelUrl, backLinkUrl, headerTitle, courtLocations });
}

hearingArrangementResponseController.get(GA_RESPONSE_HEARING_ARRANGEMENT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const hearingArrangement = gaResponse?.hearingArrangement || new HearingArrangement();
    const form = new GenericForm(hearingArrangement);
    await renderView(gaResponse, claim, form, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingArrangementResponseController.post(GA_RESPONSE_HEARING_ARRANGEMENT_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const hearingArrangement: HearingArrangement = new HearingArrangement(req.body.option, req.body.reasonForPreferredHearingType, req.body.courtLocation);
    const form = new GenericForm(hearingArrangement);
    await form.validate();
    if (form.hasErrors()) {
      const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(<AppRequest>req));
      await renderView(gaResponse, claim, form, req, res);
    } else {
      await saveRespondentHearingArrangement(generateRedisKeyForGA(<AppRequest>req), hearingArrangement);
      res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONSE_HEARING_CONTACT_DETAILS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default hearingArrangementResponseController;
