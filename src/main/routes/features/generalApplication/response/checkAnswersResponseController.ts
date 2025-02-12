import { NextFunction, RequestHandler, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import {GA_RESPONSE_CHECK_ANSWERS_URL, GA_RESPONSE_CONFIRMATION_URL, GA_RESPONSE_HEARING_SUPPORT_URL} from 'routes/urls';
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
import { submitApplicationResponse } from 'services/features/generalApplication/response/submitApplicationResponse';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {QualifiedStatementOfTruth} from 'models/generalApplication/QualifiedStatementOfTruth';

const gaCheckAnswersResponseController = Router();
const viewPath = 'features/generalApplication/response/check-answers';

async function renderView(claimId: string, claim: Claim, form: GenericForm<StatementOfTruthForm>, gaResponse: GaResponse, req: AppRequest, res: Response): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONSE_HEARING_SUPPORT_URL);
  const isBusiness = (claim.isClaimant() && claim.isClaimantBusiness()) || (claim.isDefendant() && claim.isBusiness());
  res.render(viewPath, {
    form,
    cancelUrl,
    backLinkUrl,
    isBusiness,
    headerTitle: getTitle(gaResponse.generalApplicationType, lang),
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
    const claimId = req.params.id;
    const appId = req.params.appId;
    const claim = await getClaimById(claimId, req, true);
    let statementOfTruth;
    if ((claim.isClaimant() && claim.isClaimantBusiness()) || (claim.isDefendant() && claim.isBusiness())) {
      statementOfTruth = new QualifiedStatementOfTruth(req.body.signed, req.body.name, req.body.title);
    } else {
      statementOfTruth = new StatementOfTruthForm(req.body.signed, req.body.name);
    }
    const form = new GenericForm(statementOfTruth);
    await form.validate();

    if (form.hasErrors()) {

      const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
      await renderView(claimId, claim, form, gaResponse, req, res);
    } else {
      const redisKey = generateRedisKeyForGA(req);
      await saveRespondentStatementOfTruth(redisKey, statementOfTruth);
      await submitApplicationResponse(req);
      res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONSE_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const getTitle = (generalAppTypes: ApplicationTypeOption[], lng: string) => {

  return (generalAppTypes.length == 1)
    ? getRespondToApplicationCaption(generalAppTypes, lng)
    : t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.RESPOND_TO_AN_APPLICATION', {lng});
};
export default gaCheckAnswersResponseController;
