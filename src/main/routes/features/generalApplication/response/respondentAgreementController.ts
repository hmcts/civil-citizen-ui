import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {GenericForm} from 'common/form/models/genericForm';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {GA_RESPONDENT_AGREEMENT_URL} from 'routes/urls';
import {getCancelUrl, saveRespondentAgreement} from 'services/features/generalApplication/generalApplicationService';
import {RespondentAgreement} from 'common/models/generalApplication/response/respondentAgreement';
import {Claim} from 'common/models/claim';
import {
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/response/generalApplicationResponseService';

const respondentAgreementController = Router();
const viewPath = 'features/generalApplication/respondent-agreement';

const renderView = async (claimId: string, claim: Claim, form: GenericForm<RespondentAgreement>, lng: string, res: Response): Promise<void> => {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = 'test'; // TODO: add url
  res.render(viewPath, {
    cancelUrl,
    caption: getRespondToApplicationCaption(claim, lng),
    backLinkUrl,
    form,
  });
};

respondentAgreementController.get(GA_RESPONDENT_AGREEMENT_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const lang = req.query.lang || req.cookies.lang;
  const redisKey = generateRedisKey(req);
  const claim = await getCaseDataFromStore(redisKey);
  const respondentAgreement = claim.generalApplication?.response?.respondentAgreement || new RespondentAgreement();
  const form = new GenericForm(respondentAgreement);

  renderView(claimId, claim, form, lang, res).catch((error) => {
    next(error);
  });
});

respondentAgreementController.post(GA_RESPONDENT_AGREEMENT_URL, (async (req: AppRequest<RespondentAgreement>, res: Response, next: NextFunction) => {
  try {
    const { option, reasonForDisagreement } = req.body;
    const respondentAgreement = new RespondentAgreement(option, reasonForDisagreement);
    const form = new GenericForm(respondentAgreement);
    await form.validate();
    if (form.hasErrors()) {
      const claimId = req.params.id;
      const redisKey = generateRedisKey(req);
      const claim = await getCaseDataFromStore(redisKey);
      const lang = req.query.lang || req.cookies.lang;
      return await renderView(claimId, claim, form, lang, res);
    }
    await saveRespondentAgreement(generateRedisKey(req), respondentAgreement);
    res.redirect('test'); // TODO: add url
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondentAgreementController;
