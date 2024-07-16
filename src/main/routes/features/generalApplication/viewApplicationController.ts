import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_URL, GA_PAY_ADDITIONAL_FEE_URL, GA_VIEW_APPLICATION_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getApplicationSections} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {ApplicationResponse} from 'common/models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { t } from 'i18next';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';

const viewApplicationController = Router();
const viewPath = 'features/generalApplication/view-applications';
const backLinkUrl = 'test'; // TODO: add url

viewApplicationController.get(GA_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const applicationId = req.query.applicationId ? String(req.query.applicationId) : null;
    const applicationIndex = queryParamNumber(req, 'index');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const summaryRows = await getApplicationSections(req, applicationId, lang);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const isResponseFromCourt = applicationResponse.case_data?.judicialDecision?.decision ? true : false;
    let responseFromCourt: SummaryRow[] = [];
    let payAdditionalFeeUrl: string = null;
    if(isResponseFromCourt) {
      responseFromCourt = getJudgeResponseSummary(applicationResponse, lang);
      payAdditionalFeeUrl = constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, GA_PAY_ADDITIONAL_FEE_URL)
    }
    
    res.render(viewPath, {
      backLinkUrl, 
      summaryRows, 
      pageTitle, 
      dashboardUrl: DASHBOARD_URL, 
      applicationIndex, 
      isResponseFromCourt, 
      responseFromCourt,
      payAdditionalFeeUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const getJudgeResponseSummary = (applicationResponse: ApplicationResponse, lng: string): SummaryRow[] => {
    const rows: SummaryRow[] = [];
    const documentUrl = 'test';
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(new Date(applicationResponse.created_date), lng)),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), `<a href="${documentUrl}">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT', {lng})}</a>`),
    );
    return rows;
};

export default viewApplicationController;
