import { NextFunction, RequestHandler, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { GA_RESPONSE_CHECK_ANSWERS_URL } from 'routes/urls';
import { getClaimById } from 'modules/utilityService';
import { StatementOfTruthForm } from 'common/models/generalApplication/statementOfTruthForm';
import { GenericForm } from 'common/form/models/genericForm';
import { Claim } from 'common/models/claim';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { caseNumberPrettify } from 'common/utils/stringUtils';
import { getSummarySections } from 'services/features/generalApplication/response/checkAnswersResponseService';
import { t } from 'i18next';
import { getRespondToApplicationCaption, saveRespondentStatementOfTruth } from 'services/features/generalApplication/response/generalApplicationResponseService';
import { generateRedisKeyForGA } from 'modules/draft-store/draftStoreService';
import { getDraftGARespondentResponse } from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';

const gaCheckAnswersResponseController = Router();
const viewPath = 'features/generalApplication/response/check-answers';
const backLinkUrl = 'test'; // TODO: add url

async function renderView(claimId: string, claim: Claim, form: GenericForm<StatementOfTruthForm>, gaResponse: GaResponse, req: AppRequest, res: Response): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  res.render(viewPath, { 
    form, 
    cancelUrl, 
    backLinkUrl, 
    headerTitle: getTitle(claim, req.params.appId, lang), 
    claimIdPrettified: caseNumberPrettify(claimId), 
    claim, 
    summaryRows: getSummarySections(claimId, req.params.appId, gaResponse, lang),
  });
}

gaCheckAnswersResponseController.get(
  GA_RESPONSE_CHECK_ANSWERS_URL,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);
      const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
      const statementOfTruthForm = gaResponse.statementOfTruth || new StatementOfTruthForm();
      const form = new GenericForm(statementOfTruthForm);
      await renderView(claimId, claim, form, gaResponse, req, res);
    } catch (error) {
      next(error);
    }
  });

gaCheckAnswersResponseController.post(GA_RESPONSE_CHECK_ANSWERS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const statementOfTruth = new StatementOfTruthForm(req.body.signed, req.body.name);
    const form = new GenericForm(statementOfTruth);
    await form.validate();
    if (form.hasErrors()) {
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);
      const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
      await renderView(claimId, claim, form, gaResponse, req, res);
    } else {
      const redisKey = generateRedisKeyForGA(req);
      await saveRespondentStatementOfTruth(redisKey, statementOfTruth);
      res.redirect('test'); // TODO: correct URL      
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const getTitle = (claim: Claim, appId: string, lng: string) => {
  const application = claim.respondentGaAppDetails?.find((application) => application.gaApplicationId === appId);
  return (application && application.generalAppTypes.length == 1)
    ? getRespondToApplicationCaption(claim, appId, lng)
    : t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.RESPOND_TO_AN_APPLICATION', {lng});
};
export default gaCheckAnswersResponseController;