import config from 'config';
import { t } from 'i18next';
import { NextFunction, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { GA_APPLICATION_SUMMARY_URL, GA_VIEW_APPLICATION_URL } from 'routes/urls';
import { getApplicationStatus, getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { GeneralApplicationClient } from 'client/generalApplicationClient';
import { ApplicationSummary, StatusColor } from 'common/models/generalApplication/applicationSummary';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { dateTimeFormat } from 'common/utils/dateUtils';

const applicationSummaryController = Router();
const viewPath = 'features/generalApplication/applications-summary';

const generalApplicationServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const generalApplicationServiceClient: GeneralApplicationClient = new GeneralApplicationClient(generalApplicationServiceApiBaseUrl);

applicationSummaryController.get(GA_APPLICATION_SUMMARY_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang || req.cookies.lang;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const applications = await generalApplicationServiceClient.getApplications(req);
    
    const applicationsRows: ApplicationSummary[] = [];
    applications.forEach(application => {
      const status = getApplicationStatus(application.state);
      applicationsRows.push({
        state: t(`PAGES.GENERAL_APPLICATION.SUMMARY.${application.state}`, {lng}),
        status: t(`PAGES.GENERAL_APPLICATION.SUMMARY.${status}`, {lng}),
        statusColor: StatusColor[status],
        types: application.case_data?.applicationTypes,
        id: application.id,
        createdDate: dateTimeFormat(application.created_date, lng),
        applicationUrl: `${constructResponseUrlWithIdParams(application.id, GA_VIEW_APPLICATION_URL)}?applicationId=${application.id}` 
      })
    });

    res.render(viewPath, {
      applicationsRows,
      dashboardUrl: await getCancelUrl(req.params.id, claim),
      pageTitle: 'PAGES.GENERAL_APPLICATION.SUMMARY.MY_APPLICATIONS',
    });
  } catch (error) {
    next(error);
  }
});

export default applicationSummaryController;
