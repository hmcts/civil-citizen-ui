import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_ACCEPT_DEFENDANT_OFFER_URL,
  GA_AGREE_TO_ORDER_URL,
  GA_RESPONDENT_AGREEMENT_URL,
  GA_RESPONDENT_INFORMATION_URL,
  GA_RESPONSE_VIEW_APPLICATION_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getApplicationSections,} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

const viewApplicationToRespondentController = Router();
const viewPath = 'features/generalApplication/response/view-application';

viewApplicationToRespondentController.get(GA_RESPONSE_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const applicationId = req.params.appId ? String(req.params.appId) : null;
    const claimId = req.params.id;
    const applicationIndex = queryParamNumber(req, 'index') ? queryParamNumber(req, 'index') : '1';
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const summaryRows = await getApplicationSections(req, applicationId, lang);
    const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, applicationId, GA_RESPONDENT_INFORMATION_URL);
    const redirectUrl = await getRedirectUrl(req, applicationId, claimId);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    res.render(viewPath, {backLinkUrl, summaryRows, pageTitle, redirectUrl, applicationIndex });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

async function getRedirectUrl(req: AppRequest, applicationId: string, claimId: string) {
  const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
  const claimantRespondingToDefendantVaryAJudgment =  applicationResponse.case_data.generalAppType.types.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) && (applicationResponse.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.NO);
  const withConsent = applicationResponse.case_data.generalAppType.types.includes(ApplicationTypeOption.SETTLE_BY_CONSENT);
  if(claimantRespondingToDefendantVaryAJudgment){
    return constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_ACCEPT_DEFENDANT_OFFER_URL);
  }else if(withConsent){
    return constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_AGREE_TO_ORDER_URL);
  }else{
    return constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_RESPONDENT_AGREEMENT_URL);
  }
}
export default viewApplicationToRespondentController;
