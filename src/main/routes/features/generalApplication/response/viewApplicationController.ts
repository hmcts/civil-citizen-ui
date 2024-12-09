import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DEFENDANT_SUMMARY_URL,
  GA_ACCEPT_DEFENDANT_OFFER_URL,
  GA_AGREE_TO_ORDER_URL,
  GA_RESPONDENT_AGREEMENT_URL,
  GA_RESPONSE_VIEW_APPLICATION_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
  GA_APPLICATION_RESPONSE_SUMMARY_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getRespondentDocuments,
  getResponseFromCourtSection, getResponseSummaryCardSections,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  getApplicationFromGAService, hasRespondentResponded,
  saveApplicationTypesToGaResponse,
} from 'services/features/generalApplication/generalApplicationService';
import {DocumentsViewComponent} from 'form/models/documents/DocumentsViewComponent';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {deleteDraftClaimFromStore, generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {isRespondentAllowedToRespond} from 'services/features/generalApplication/response/viewApplicationService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {canUploadAddlDoc} from 'services/features/generalApplication/additionalDocumentService';

const viewApplicationToRespondentController = Router();
const viewPathPreResponse = 'features/generalApplication/response/view-application';
const viewPathPostResponse = 'features/generalApplication/view-applications';

viewApplicationToRespondentController.get(GA_RESPONSE_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(claimId, req, true);
    const applicationId = req.params.appId ? String(req.params.appId) : null;
    const applicationIndex = queryParamNumber(req, 'index') ? queryParamNumber(req, 'index') : '1';
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const applicationTypeCards = getResponseSummaryCardSections(applicationResponse, lang);
    const {summaryRows, responseSummaries} = await getApplicationSections(req, applicationResponse, lang);
    const redirectUrl = await getRedirectUrl(applicationResponse, applicationId, claimId);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    const applicantDocuments: DocumentsViewComponent = getApplicantDocuments(applicationResponse, lang);
    const courtDocuments: DocumentsViewComponent = getCourtDocuments(applicationResponse, lang);
    const respondentDocuments: DocumentsViewComponent = getRespondentDocuments(applicationResponse, lang);
    const responseFromCourt = await getResponseFromCourtSection(req, req.params.appId, lang);
    const dashboardUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    const isAllowedToRespond = isRespondentAllowedToRespond(applicationResponse);
    const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_APPLICATION_RESPONSE_SUMMARY_URL);
    const viewPath = hasRespondentResponded(applicationResponse) ? viewPathPostResponse : viewPathPreResponse;
    const caseProgressionCaseState = claim.isCaseProgressionCaseState();
    const uploadDocsTrialUrl = constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL);
    let additionalDocUrl : string = null;
    if(canUploadAddlDoc(applicationResponse)) {
      additionalDocUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, req.params.appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL);
    }
    await deleteDraftClaimFromStore(claimId);

    await saveApplicationTypesToGaResponse(isAllowedToRespond, generateRedisKeyForGA(req), applicationResponse.case_data.generalAppType.types, applicationResponse.case_data.generalAppUrgencyRequirement);
    res.render(viewPath, {
      backLinkUrl,
      applicationTypeCards,
      summaryRows,
      responseSummaries,
      pageTitle,
      redirectUrl,
      applicationIndex,
      applicantDocuments,
      courtDocuments,
      respondentDocuments,
      additionalDocUrl,
      responseFromCourt,
      dashboardUrl,
      isAllowedToRespond,
      caseProgressionCaseState,
      uploadDocsTrialUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

async function getRedirectUrl(applicationResponse: ApplicationResponse, applicationId: string, claimId: string) {
  const claimantRespondingToDefendantVaryAJudgment = applicationResponse.case_data.generalAppType.types.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);
  const withConsent = applicationResponse.case_data.generalAppRespondentAgreement.hasAgreed === YesNoUpperCamelCase.YES;
  const isClaimantRespondent = (applicationResponse.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.NO);

  if (isClaimantRespondent && claimantRespondingToDefendantVaryAJudgment) {
    return constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_ACCEPT_DEFENDANT_OFFER_URL);
  }
  if (withConsent && !claimantRespondingToDefendantVaryAJudgment) {
    return constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_AGREE_TO_ORDER_URL);
  }
  return constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_RESPONDENT_AGREEMENT_URL);
}

export default viewApplicationToRespondentController;
