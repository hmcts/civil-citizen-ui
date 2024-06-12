import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_AGREE_TO_ORDER_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {
  getCancelUrl,
  getRespondToApplicationCaption,
  saveRespondentAgreeToOrder,
} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {GenericYesNo} from 'form/models/genericYesNo';

const respondentAgreeToOrderController = Router();
const viewPath = 'features/generalApplication/agree-to-order';
const backLinkUrl = 'test'; // TODO: add url

respondentAgreeToOrderController.get(GA_AGREE_TO_ORDER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caption: string = getRespondToApplicationCaption(claim, lang);
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.respondentAgreeToOrder));

    res.render(viewPath, {
      form,
      caption,
      cancelUrl,
      backLinkUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondentAgreeToOrderController.post(GA_AGREE_TO_ORDER_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caption: string = getRespondToApplicationCaption(claim, lang);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.AGREE_TO_ORDER_NOT_SELECTED'));

    form.validateSync();

    if (form.hasErrors()) {
      res.render(viewPath, { form, caption,cancelUrl, backLinkUrl });
    } else {
      await saveRespondentAgreeToOrder(redisKey, claim, req.body.option);
      res.redirect('test_url');
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondentAgreeToOrderController;
