import { NextFunction, RequestHandler, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { GenericForm } from 'common/form/models/genericForm';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { RESPONDENT_AGREEMENT_URL } from 'routes/urls';
import { getCancelUrl, getRespondToApplicationCaption, saveRespondentAgreement } from 'services/features/generalApplication/generalApplicationService';
import { RespondentAgreement } from 'common/models/generalApplication/respondentAgreement';

const respondentAgreementController = Router();
const viewPath = 'features/generalApplication/respondent-agreement';
const backLinkUrl = 'test'; // TODO: add url

const renderView = async (req: AppRequest, res: Response, form?: GenericForm<RespondentAgreement>): Promise<void> => {
  const claimId = req.params.id;
  const redisKey = generateRedisKey(req);
  const claim = await getCaseDataFromStore(redisKey);
  const cancelUrl = await getCancelUrl(claimId, claim);
  if (!form) {
    const respondentAgreement = claim.generalApplication?.respondentAgreement || new RespondentAgreement();
    form = new GenericForm(respondentAgreement);
  }
  res.render(viewPath, {
    cancelUrl,
    caption: getRespondToApplicationCaption(claim, req.query.lang || req.cookies.lang),
    backLinkUrl,
    form,
  });
};

respondentAgreementController.get(RESPONDENT_AGREEMENT_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  renderView(req, res).catch((error) => {
    next(error);
  });
});

respondentAgreementController.post(RESPONDENT_AGREEMENT_URL, (async (req: AppRequest<RespondentAgreement>, res: Response, next: NextFunction) => {
  try {
    const { option, reasonForDisagreement } = req.body;
    const respondentAgreement = new RespondentAgreement(option, reasonForDisagreement);
    const form = new GenericForm(respondentAgreement);
    await form.validate();
    if (form.hasErrors()) {
      return await renderView(req, res, form);
    }
    await saveRespondentAgreement(generateRedisKey(req), respondentAgreement);
    res.redirect('test'); // TODO: add url
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondentAgreementController;
