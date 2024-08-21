import config from 'config';
import { t } from 'i18next';
import { NextFunction, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { GA_APPLICATION_SUMMARY_URL, GA_VIEW_APPLICATION_URL } from 'routes/urls';
import { getApplicationStatus, getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { GaServiceClient } from 'client/gaServiceClient';
import { ApplicationSummary, StatusColor } from 'common/models/generalApplication/applicationSummary';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import { dateTimeFormat } from 'common/utils/dateUtils';
import { getClaimById } from 'modules/utilityService';

const applicationSummaryController = Router();
const viewPath = 'features/generalApplication/applications-summary';

const generalApplicationServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const generalApplicationServiceClient: GaServiceClient = new GaServiceClient(generalApplicationServiceApiBaseUrl);

applicationSummaryController.get(GA_APPLICATION_SUMMARY_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang || req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const applications = await generalApplicationServiceClient.getApplicationsByCaseId(claimId, req);
    
    const applicationsRows: ApplicationSummary[] = [];
    applications.forEach((application, index) => {
      const status = getApplicationStatus(application.state);
      applicationsRows.push({
        state: t(`PAGES.GENERAL_APPLICATION.SUMMARY.STATES.${application.state}`, {lng}),
        status: t(`PAGES.GENERAL_APPLICATION.SUMMARY.${status}`, {lng}),
        statusColor: StatusColor[status],
        types: application.case_data?.applicationTypes,
        id: application.id,
        createdDate: dateTimeFormat(application.created_date, lng),
        applicationUrl: `${constructResponseUrlWithIdAndAppIdParams(claimId, application.id,  GA_VIEW_APPLICATION_URL)}?index=${index + 1}`,
      });
    });

    res.render(viewPath, {
      applicationsRows,
      dashboardUrl: await getCancelUrl(claimId, claim),
      pageTitle: 'PAGES.GENERAL_APPLICATION.SUMMARY.MY_APPLICATIONS',
    });
  } catch (error) {
    next(error);
  }
});

export default applicationSummaryController;
