import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_PROVIDE_MORE_INFORMATION_URL,
  GA_ACCEPT_DEFENDANT_OFFER_URL,
  GA_AGREE_TO_ORDER_URL,
  GA_RESPONDENT_AGREEMENT_URL,
  GA_RESPONDENT_INFORMATION_URL,
  GA_RESPONSE_VIEW_APPLICATION_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getRequestWrittenRepresentations,
  getRespondentDocuments,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  getApplicationFromGAService,
  saveApplicationTypesToGaResponse,
} from 'services/features/generalApplication/generalApplicationService';
import {DocumentsViewComponent} from 'form/models/documents/DocumentsViewComponent';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {SummaryRow} from 'models/summaryList/summaryList';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';

const viewApplicationToRespondentController = Router();
const viewPath = 'features/generalApplication/response/view-application';

viewApplicationToRespondentController.get(GA_RESPONSE_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const applicationId = req.params.appId ? String(req.params.appId) : null;
    const applicationIndex = queryParamNumber(req, 'index') ? queryParamNumber(req, 'index') : '1';
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const summaryRows = await getApplicationSections(req, applicationId, lang);
    const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, applicationId, GA_RESPONDENT_INFORMATION_URL);
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const redirectUrl = await getRedirectUrl(applicationResponse, applicationId, claimId);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    const applicantDocuments: DocumentsViewComponent = getApplicantDocuments(applicationResponse, lang);
    const courtDocuments: DocumentsViewComponent = getCourtDocuments(applicationResponse, lang);
    const respondentDocuments: DocumentsViewComponent = getRespondentDocuments(applicationResponse, lang);
    const additionalDocUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, applicationId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL);
    const isRequestWrittenRepresentations = !!applicationResponse.case_data?.judicialDecisionMakeAnOrderForWrittenRepresentations?.makeAnOrderForWrittenRepresentations;
    let requestWrittenRepresentations: SummaryRow[] = [];
    let requestWrittenRepresentationsUrl: string = null;
    if (isRequestWrittenRepresentations) {
      requestWrittenRepresentations = getRequestWrittenRepresentations(applicationResponse, lang);
      requestWrittenRepresentationsUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_PROVIDE_MORE_INFORMATION_URL);
    }
    await saveApplicationTypesToGaResponse(applicationResponse.state, generateRedisKeyForGA(req), applicationResponse.case_data.generalAppType.types);
    res.render(viewPath, {
      backLinkUrl,
      summaryRows,
      pageTitle,
      redirectUrl,
      applicationIndex,
      applicantDocuments,
      courtDocuments,
      respondentDocuments,
      additionalDocUrl,
      isRequestWrittenRepresentations,
      requestWrittenRepresentations,
      requestWrittenRepresentationsUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

async function getRedirectUrl(applicationResponse: ApplicationResponse, applicationId: string, claimId: string) {
  const claimantRespondingToDefendantVaryAJudgment = applicationResponse.case_data.generalAppType.types.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);
  const withConsent = applicationResponse.case_data.generalAppRespondentAgreement.hasAgreed === YesNoUpperCamelCase.YES;
  if (claimantRespondingToDefendantVaryAJudgment) {
    return constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_ACCEPT_DEFENDANT_OFFER_URL);
  } else if (withConsent) {
    return constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_AGREE_TO_ORDER_URL);
  }
  return constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_RESPONDENT_AGREEMENT_URL);
}

export default viewApplicationToRespondentController;
