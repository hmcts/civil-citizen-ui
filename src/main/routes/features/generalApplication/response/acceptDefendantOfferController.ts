import { NextFunction, RequestHandler, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { GenericForm } from 'common/form/models/genericForm';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { GA_ACCEPT_DEFENDANT_OFFER_URL } from 'routes/urls';
import { getCancelUrl, saveAcceptDefendantOffer } from 'services/features/generalApplication/generalApplicationService';
import { Claim } from 'common/models/claim';
import { AcceptDefendantOffer } from 'common/models/generalApplication/response/acceptDefendantOffer';
import { getRespondToApplicationCaption } from 'services/features/generalApplication/response/generalApplicationResponseService';

const acceptDefendantOfferController = Router();
const viewPath = 'features/generalApplication/response/accept-defendant-offer';

const renderView = async (claimId: string, claim: Claim, form: GenericForm<AcceptDefendantOffer>, lng: string, res: Response): Promise<void> => {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = 'test'; // TODO: add url
  res.render(viewPath, {
    cancelUrl,
    caption: getRespondToApplicationCaption(claim, lng),
    backLinkUrl,
    form,
  });
};

acceptDefendantOfferController.get(GA_ACCEPT_DEFENDANT_OFFER_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang || req.cookies.lang;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const acceptDefendantOffer = claim.generalApplication?.response?.acceptDefendantOffer || new AcceptDefendantOffer();
    const form = new GenericForm(acceptDefendantOffer);
    renderView(claimId, claim, form, lang, res);
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
    if (form.hasErrors()) {
      const claimId = req.params.id;
      const redisKey = generateRedisKey(req);
      const claim = await getCaseDataFromStore(redisKey);
      const lang = req.query.lang || req.cookies.lang;
      return await renderView(claimId, claim, form, lang, res);
    }
    await saveAcceptDefendantOffer(generateRedisKey(req), acceptDefendantOffer);
    res.redirect('test'); // TODO: add url
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default acceptDefendantOfferController;
