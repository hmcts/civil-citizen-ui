import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_URL, GA_PAY_ADDITIONAL_FEE_URL, GA_VIEW_APPLICATION_URL,GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  getApplicationSections,
  getJudgeApproveEdit,
  getJudgeDismiss,
  getJudgeResponseSummary, getReturnDashboardUrl
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {
  ApplicationResponse,
  JudicialDecisionMakeAnOrderOptions
} from 'common/models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {SummaryRow} from 'common/models/summaryList/summaryList';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';

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
    const isJudgesApproveEdit = applicationResponse.case_data?.judicialDecisionMakeOrder?.makeAnOrder == JudicialDecisionMakeAnOrderOptions.APPROVE_OR_EDIT;
    const isJudgesDismiss = applicationResponse.case_data?.judicialDecisionMakeOrder?.makeAnOrder == JudicialDecisionMakeAnOrderOptions.DISMISS_THE_APPLICATION;
    let responseFromCourt: SummaryRow[] = [];
    let payAdditionalFeeUrl: string = null;
    let judgesApproveEdit: SummaryRow[] = [];
    let judgesDismiss: SummaryRow[] = [];
    let returnDashboardUrl: string = null;

    if(isResponseFromCourt) {
      responseFromCourt = getJudgeResponseSummary(applicationResponse, lang);
      payAdditionalFeeUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_PAY_ADDITIONAL_FEE_URL);
    }

    if(isJudgesApproveEdit) {
      judgesApproveEdit = getJudgeApproveEdit(applicationResponse, lang);
      returnDashboardUrl = await getReturnDashboardUrl(claimId, req);
    }

    if(isJudgesDismiss) {
      judgesDismiss = getJudgeDismiss(applicationResponse, lang);
      returnDashboardUrl = await getReturnDashboardUrl(claimId, req);
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
      isJudgesApproveEdit,
      judgesApproveEdit,
      isJudgesDismiss,
      judgesDismiss,
      returnDashboardUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewApplicationController;
