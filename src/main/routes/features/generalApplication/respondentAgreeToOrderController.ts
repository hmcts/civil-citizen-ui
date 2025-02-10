import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_AGREE_TO_ORDER_URL,
  GA_RESPONDENT_AGREEMENT_URL,
  GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL,
  GA_RESPONSE_VIEW_APPLICATION_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  getRespondToApplicationCaption,
  saveRespondentAgreeToOrder,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';

const respondentAgreeToOrderController = Router();
const viewPath = 'features/generalApplication/agree-to-order';

respondentAgreeToOrderController.get(GA_AGREE_TO_ORDER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(<AppRequest>req));
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caption: string = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
    const backLinkUrl = BACK_URL;

    const form = new GenericForm(new GenericYesNo(gaResponse?.agreeToOrder));

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
    const redisKey = generateRedisKeyForGA(<AppRequest>req);
    const claimId = req.params.id;
    const applicationId = req.params.appId;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;

    const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.id, GA_RESPONSE_VIEW_APPLICATION_URL);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.AGREE_TO_ORDER_NOT_SELECTED'));

    form.validateSync();

    if (form.hasErrors()) {
      const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(<AppRequest>req));
      const caption: string = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
      res.render(viewPath, {form, caption, cancelUrl, backLinkUrl});
    } else {
      await saveRespondentAgreeToOrder(redisKey, req.body.option);
      res.redirect(getRedirectUrl(claimId, applicationId, req.body.option));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getRedirectUrl(claimId: string, applicationId: string, option: YesNo.YES) {
  return option === YesNo.YES ? constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL) : constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_RESPONDENT_AGREEMENT_URL);
}

export default respondentAgreeToOrderController;
