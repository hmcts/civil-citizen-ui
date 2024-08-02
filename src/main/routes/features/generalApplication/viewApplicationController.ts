import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_URL, GA_APPLY_HELP_WITH_FEE_SELECTION, GA_PAY_ADDITIONAL_FEE_URL, GA_VIEW_APPLICATION_URL,GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getApplicationSections, getJudgeResponseSummary} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {ApplicationResponse, JudicialDecisionOptions} from 'common/models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {SummaryRow} from 'common/models/summaryList/summaryList';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';

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
    const decisionFromCourt = !!applicationResponse.case_data?.judicialDecision?.decision;
    const judgeResponseType = applicationResponse.case_data.judicialDecision.decision;
    const isResponseFromCourt = !!applicationResponse.case_data?.judicialDecision?.decision;
    // const responseDocument = applicationResponse.case_data?.requestForInformationDocument;
    let showRequestMoreInfoButton = false;
    let responseFromCourt: SummaryRow[] = [];
    let payAdditionalFeeUrl: string = null;
    const isApplicationFeeAmountNotPaid = isApplicationFeeNotPaid(applicationResponse);
    let applicationFeeOptionUrl : string = null;
    // let requestMoreInfoUrl: string = null;

    if(judgeResponseType === JudicialDecisionOptions.MAKE_AN_ORDER) {
      responseFromCourt = getJudgeResponseSummary(applicationResponse, lang);
      payAdditionalFeeUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_PAY_ADDITIONAL_FEE_URL);
    } else {
      if(judgeResponseType === JudicialDecisionOptions.REQUEST_MORE_INFO) {
        showRequestMoreInfoButton = true;
        responseFromCourt = getJudgeResponseSummary(applicationResponse, lang);
        // requestMoreInfoUrl = constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, responseDocument);
      }
    }

    if(isApplicationFeeAmountNotPaid) {
      applicationFeeOptionUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION);
    }

    res.render(viewPath, {
      backLinkUrl,
      summaryRows,
      pageTitle,
      dashboardUrl: DASHBOARD_URL,
      applicationIndex,
      isResponseFromCourt,
      responseFromCourt,
      decisionFromCourt,
      judgeResponseType,
      additionalDocUrl,
      payAdditionalFeeUrl,
      isApplicationFeeAmountNotPaid,
      applicationFeeOptionUrl,
      showRequestMoreInfoButton,
      // requestMoreInfoUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const isApplicationFeeNotPaid = (applicationResponse : ApplicationResponse) => {
  return applicationResponse?.case_data?.generalAppPBADetails?.paymentDetails?.status !== 'SUCCESS' && applicationResponse?.state === ApplicationState.AWAITING_APPLICATION_PAYMENT;
};

export default viewApplicationController;
