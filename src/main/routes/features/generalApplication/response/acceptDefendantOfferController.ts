import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {GenericForm} from 'common/form/models/genericForm';
import {generateRedisKey, generateRedisKeyForGA, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  CASE_DOCUMENT_VIEW_URL,
  GA_ACCEPT_DEFENDANT_OFFER_URL,
  GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL,
  GA_RESPONSE_VIEW_APPLICATION_URL,
} from 'routes/urls';
import {
  getApplicationFromGAService,
  getCancelUrl,
  saveAcceptDefendantOffer,
} from 'services/features/generalApplication/generalApplicationService';
import {Claim} from 'common/models/claim';
import {AcceptDefendantOffer} from 'common/models/generalApplication/response/acceptDefendantOffer';
import {
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {formN245Url} from 'common/utils/externalURLs';
import {documentIdExtractor} from 'common/utils/stringUtils';

const acceptDefendantOfferController = Router();
const viewPath = 'features/generalApplication/response/accept-defendant-offer';

const renderView = async (claimId: string, claim: Claim, form: GenericForm<AcceptDefendantOffer>, lng: string, appId: string, gaResponse: GaResponse, res: Response, n245: string): Promise<void> => {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId,appId,GA_RESPONSE_VIEW_APPLICATION_URL);
  res.render(viewPath, {
    cancelUrl,
    caption: getRespondToApplicationCaption(gaResponse.generalApplicationType, lng),
    backLinkUrl,
    form,
    n245,
  });
};

acceptDefendantOfferController.get(GA_ACCEPT_DEFENDANT_OFFER_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const applicationId = req.params.appId ? String(req.params.appId) : null;
    const lang = req.query.lang || req.cookies.lang;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const n245Doc = getN245(applicationResponse, applicationId);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const acceptDefendantOffer = gaResponse?.acceptDefendantOffer || new AcceptDefendantOffer();
    const form = new GenericForm(acceptDefendantOffer);
    renderView(claimId, claim, form, lang, req.params.appId, gaResponse, res, n245Doc);
  } catch (error) {
    next(error);
  }
});

acceptDefendantOfferController.post(GA_ACCEPT_DEFENDANT_OFFER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const acceptDefendantOffer = new AcceptDefendantOffer(
      req.body.option,
      req.body.type,
      req.body.amountPerMonth,
      req.body.reasonProposedInstalment,
      req.body.year,
      req.body.month,
      req.body.day,
      req.body.reasonProposedSetDate,
    );
    const form = new GenericForm(acceptDefendantOffer);
    const claimId = req.params.id;
    await form.validate();
    if (form.hasErrors()) {
      const redisKey = generateRedisKey(req);
      const claim = await getCaseDataFromStore(redisKey);
      const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
      const lang = req.query.lang || req.cookies.lang;
      const applicationId = req.params.appId ? String(req.params.appId) : null;
      const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
      const n245Doc = getN245(applicationResponse, applicationId);
      return await renderView(claimId, claim, form, lang, req.params.appId, gaResponse, res, n245Doc);
    }
    await saveAcceptDefendantOffer(generateRedisKeyForGA(req), acceptDefendantOffer);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getN245(applicationResponse: ApplicationResponse, applicationId: string) {
  const n245DocIn = applicationResponse?.case_data?.generalAppN245FormUpload;
  let n245Doc = formN245Url;
  if(n245DocIn) {
    n245Doc = CASE_DOCUMENT_VIEW_URL.replace(':id', applicationId)
      .replace(':documentId',
        documentIdExtractor(n245DocIn.document_binary_url));
  }
  return n245Doc;
}

export default acceptDefendantOfferController;
