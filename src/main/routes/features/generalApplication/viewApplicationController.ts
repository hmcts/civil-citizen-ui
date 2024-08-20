import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_URL,
  GA_PAY_ADDITIONAL_FEE_URL,
  GA_VIEW_APPLICATION_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getJudgeResponseSummary,
  getRespondentDocuments,
  getJudgesDirectionsOrder,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {
  ApplicationResponse,
} from 'common/models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {SummaryRow} from 'common/models/summaryList/summaryList';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
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
    const isResponseFromCourt = !!applicationResponse.case_data?.judicialDecision?.decision;
    const isJudgesDirectionsOrder = applicationResponse.case_data?.judicialDecisionMakeOrder?.directionsResponseByDate != undefined;
    let responseFromCourt: SummaryRow[] = [];
    const applicantDocuments : DocumentsViewComponent = getApplicantDocuments(applicationResponse, lang);
    const courtDocuments: DocumentsViewComponent = getCourtDocuments(applicationResponse, lang);
    const respondentDocuments: DocumentsViewComponent = getRespondentDocuments(applicationResponse, lang);
    let judgesDirectionsOrder: SummaryRow[] = [];
    let payAdditionalFeeUrl: string = null;
    const isApplicationFeeAmountNotPaid = isApplicationFeeNotPaid(applicationResponse);
    let applicationFeeOptionUrl : string = null;
    let judgesDirectionsOrderUrl: string = null;

    if(isResponseFromCourt) {
      responseFromCourt = getJudgeResponseSummary(applicationResponse, lang);
      payAdditionalFeeUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_PAY_ADDITIONAL_FEE_URL);
    }

    if(isApplicationFeeAmountNotPaid) {
      applicationFeeOptionUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION);
    }

    if(isJudgesDirectionsOrder) {
      judgesDirectionsOrder = getJudgesDirectionsOrder(applicationResponse, lang);
      judgesDirectionsOrderUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL);
    }

    res.render(viewPath, {
      backLinkUrl,
      summaryRows,
      pageTitle,
      dashboardUrl: DASHBOARD_URL,
      applicationIndex,
      isResponseFromCourt,
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
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const isApplicationFeeNotPaid = (applicationResponse : ApplicationResponse) => {
  return applicationResponse?.case_data?.generalAppPBADetails?.paymentDetails?.status !== 'SUCCESS' && applicationResponse?.state === ApplicationState.AWAITING_APPLICATION_PAYMENT;
};

export default viewApplicationController;
