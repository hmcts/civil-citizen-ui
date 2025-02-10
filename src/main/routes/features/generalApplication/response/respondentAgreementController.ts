import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {GenericForm} from 'common/form/models/genericForm';
import { generateRedisKey, generateRedisKeyForGA, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {
  BACK_URL,
  GA_RESPONDENT_AGREEMENT_URL,
  GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL,
} from 'routes/urls';
import {getCancelUrl, saveRespondentAgreement} from 'services/features/generalApplication/generalApplicationService';
import {RespondentAgreement} from 'common/models/generalApplication/response/respondentAgreement';
import {Claim} from 'common/models/claim';
import {
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import { getDraftGARespondentResponse } from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';

const respondentAgreementController = Router();
const viewPath = 'features/generalApplication/respondent-agreement';

const renderView = async (claimId: string, claim: Claim, form: GenericForm<RespondentAgreement>, lng: string, appId: string, gaResponse: GaResponse, res: Response): Promise<void> => {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = BACK_URL;
  res.render(viewPath, {
    cancelUrl,
    caption: getRespondToApplicationCaption(gaResponse.generalApplicationType, lng),
    backLinkUrl,
    form,
  });
};

respondentAgreementController.get(GA_RESPONDENT_AGREEMENT_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const lang = req.query.lang || req.cookies.lang;
  const redisKey = generateRedisKey(req);
  const claim = await getCaseDataFromStore(redisKey);
  const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
  const respondentAgreement = gaResponse?.respondentAgreement || new RespondentAgreement();
  const form = new GenericForm(respondentAgreement);

  renderView(claimId, claim, form, lang, req.params.appId, gaResponse, res).catch((error) => {
    next(error);
  });
});

respondentAgreementController.post(GA_RESPONDENT_AGREEMENT_URL, (async (req: AppRequest<RespondentAgreement>, res: Response, next: NextFunction) => {
  try {
    const { option, reasonForDisagreement } = req.body;
    const respondentAgreement = new RespondentAgreement(option, reasonForDisagreement);
    const form = new GenericForm(respondentAgreement);
    const claimId = req.params.id;
    await form.validate();
    if (form.hasErrors()) {
      const redisKey = generateRedisKey(req);
      const claim = await getCaseDataFromStore(redisKey);
      const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
      const lang = req.query.lang || req.cookies.lang;
      return await renderView(claimId, claim, form, lang, req.params.appId, gaResponse, res);
    }
    await saveRespondentAgreement(generateRedisKeyForGA(req), respondentAgreement);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondentAgreementController;
