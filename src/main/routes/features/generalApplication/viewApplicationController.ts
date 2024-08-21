import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_URL,
  GA_PAY_ADDITIONAL_FEE_URL,
  GA_VIEW_APPLICATION_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL,
  GA_PROVIDE_MORE_INFORMATION_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getJudgeResponseSummary,
  getRespondentDocuments,
  getJudgesDirectionsOrder, getRequestWrittenRepresentations,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {
  ApplicationResponse,
  JudicialDecisionOptions,
} from 'common/models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {SummaryRow} from 'common/models/summaryList/summaryList';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import { DocumentsViewComponent } from 'common/form/models/documents/DocumentsViewComponent';

const viewApplicationController = Router();
const viewPath = 'features/generalApplication/view-applications';
const backLinkUrl = 'test'; // TODO: add url

viewApplicationController.get(GA_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const applicationIndex = queryParamNumber(req, 'index');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const summaryRows = await getApplicationSections(req, req.params.appId, lang);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    const additionalDocUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, req.params.appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL);
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, req.params.appId);
    const isMakeWithNotice = applicationResponse.case_data?.judicialDecision?.decision === JudicialDecisionOptions.MAKE_AN_ORDER;
    const isRequestMoreInfo = applicationResponse.case_data?.judicialDecision?.decision === JudicialDecisionOptions.REQUEST_MORE_INFO;
    const isJudgesDirectionsOrder = !!applicationResponse.case_data?.judicialDecisionMakeOrder?.directionsResponseByDate;
    const isRequestWrittenRepresentations = !!applicationResponse.case_data?.judicialDecisionMakeAnOrderForWrittenRepresentations?.makeAnOrderForWrittenRepresentations;
    let showRequestMoreInfoButton = false;
    let responseFromCourt: SummaryRow[] = [];
    const applicantDocuments : DocumentsViewComponent = getApplicantDocuments(applicationResponse, lang);
    const courtDocuments: DocumentsViewComponent = getCourtDocuments(applicationResponse, lang);
    const respondentDocuments: DocumentsViewComponent = getRespondentDocuments(applicationResponse, lang);
    let judgesDirectionsOrder: SummaryRow[] = [];
    let requestWrittenRepresentations: SummaryRow[] = [];
    let payAdditionalFeeUrl: string = null;
    const isApplicationFeeAmountNotPaid = isApplicationFeeNotPaid(applicationResponse);
    let applicationFeeOptionUrl : string = null;
    let judgesDirectionsOrderUrl: string = null;
    let requestWrittenRepresentationsUrl: string = null;

    if(isMakeWithNotice) {
      responseFromCourt = getJudgeResponseSummary(applicationResponse, lang);
      payAdditionalFeeUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_PAY_ADDITIONAL_FEE_URL);
    }

    if(isRequestMoreInfo) {
        showRequestMoreInfoButton = true;
        responseFromCourt = getJudgeResponseSummary(applicationResponse, lang);
    }

    if(isApplicationFeeAmountNotPaid) {
      applicationFeeOptionUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_APPLY_HELP_WITH_FEE_SELECTION);
    }

    if(isJudgesDirectionsOrder) {
      judgesDirectionsOrder = getJudgesDirectionsOrder(applicationResponse, lang);
      judgesDirectionsOrderUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL);
    }

    if (isRequestWrittenRepresentations) {
      requestWrittenRepresentations = getRequestWrittenRepresentations(applicationResponse, lang);
      requestWrittenRepresentationsUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_PROVIDE_MORE_INFORMATION_URL);
    }

    res.render(viewPath, {
      backLinkUrl,
      summaryRows,
      pageTitle,
      dashboardUrl: DASHBOARD_URL,
      applicationIndex,
      isResponseFromCourt: isRequestMoreInfo || isMakeWithNotice,
      responseFromCourt,
      additionalDocUrl,
      payAdditionalFeeUrl,
      isApplicationFeeAmountNotPaid,
      applicationFeeOptionUrl,
      applicantDocuments,
      courtDocuments,
      respondentDocuments,
      isJudgesDirectionsOrder,
      judgesDirectionsOrder,
      judgesDirectionsOrderUrl,
      isRequestWrittenRepresentations,
      requestWrittenRepresentations,
      requestWrittenRepresentationsUrl,
      showRequestMoreInfoButton,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const isApplicationFeeNotPaid = (applicationResponse : ApplicationResponse) => {
  return applicationResponse?.case_data?.generalAppPBADetails?.paymentDetails?.status !== 'SUCCESS' && applicationResponse?.state === ApplicationState.AWAITING_APPLICATION_PAYMENT;
};

export default viewApplicationController;
