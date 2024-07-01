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
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { submitApplicationResponse } from 'services/features/generalApplication/response/submitApplicationResponse';

const gaCheckAnswersResponseController = Router();
const viewPath = 'features/generalApplication/response/check-answers';
const backLinkUrl = 'test'; // TODO: add url

async function renderView(claimId: string, claim: Claim, form: GenericForm<StatementOfTruthForm>, req: AppRequest, res: Response): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  res.render(viewPath, { 
    form, 
    cancelUrl, 
    backLinkUrl, 
    headerTitle: getTitle(claim, lang), 
    claimIdPrettified: caseNumberPrettify(claimId), 
    claim, 
    summaryRows: getSummarySections(claimId, claim, lang) });
}

gaCheckAnswersResponseController.get(
  GA_RESPONSE_CHECK_ANSWERS_URL,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);
      const statementOfTruthForm = claim.generalApplication?.response?.statementOfTruth || new StatementOfTruthForm();
      const form = new GenericForm(statementOfTruthForm);
      await renderView(claimId, claim, form, req, res);
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
      await renderView(claimId, claim, form, req, res);
    } else {
      const redisKey = generateRedisKey(req);
      await saveRespondentStatementOfTruth(redisKey, statementOfTruth);
      await submitApplicationResponse(req);
      res.redirect('test'); // TODO: correct URL      
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const getTitle = (claim: Claim, lng: string) =>
  (claim.generalApplication?.applicationTypes?.length == 1)
    ? getRespondToApplicationCaption(claim, lng)
    : t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.RESPOND_TO_AN_APPLICATION', {lng});

export default gaCheckAnswersResponseController;