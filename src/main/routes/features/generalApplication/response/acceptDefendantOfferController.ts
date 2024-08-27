import { NextFunction, RequestHandler, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { GenericForm } from 'common/form/models/genericForm';
import { generateRedisKey, generateRedisKeyForGA, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { GA_ACCEPT_DEFENDANT_OFFER_URL, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL, GA_RESPONSE_VIEW_APPLICATION_URL } from 'routes/urls';
import { getCancelUrl, saveAcceptDefendantOffer } from 'services/features/generalApplication/generalApplicationService';
import { Claim } from 'common/models/claim';
import { AcceptDefendantOffer } from 'common/models/generalApplication/response/acceptDefendantOffer';
import { getRespondToApplicationCaption } from 'services/features/generalApplication/response/generalApplicationResponseService';
import { getDraftGARespondentResponse } from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';

const acceptDefendantOfferController = Router();
const viewPath = 'features/generalApplication/response/accept-defendant-offer';

const renderView = async (claimId: string, claim: Claim, form: GenericForm<AcceptDefendantOffer>, lng: string, appId: string, res: Response): Promise<void> => {
  const cancelUrl = await getCancelUrl(claimId, claim);
  res.render(viewPath, {
    cancelUrl,
    caption: getRespondToApplicationCaption(claim, appId, lng),
    backLinkUrl: constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONSE_VIEW_APPLICATION_URL),
    form,
  });
};

acceptDefendantOfferController.get(GA_ACCEPT_DEFENDANT_OFFER_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang || req.cookies.lang;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const acceptDefendantOffer = gaResponse?.acceptDefendantOffer || new AcceptDefendantOffer();
    const form = new GenericForm(acceptDefendantOffer);
    renderView(claimId, claim, form, lang, req.params.appId, res);
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
    await form.validate();
    const claimId = req.params.id;
    const appId = req.params.appId;
    if (form.hasErrors()) {
      
      const redisKey = generateRedisKey(req);
      const claim = await getCaseDataFromStore(redisKey);
      const lang = req.query.lang || req.cookies.lang;
      return await renderView(claimId, claim, form, lang, req.params.appId, res);
    }
    await saveAcceptDefendantOffer(generateRedisKeyForGA(req), acceptDefendantOffer);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default acceptDefendantOfferController;
