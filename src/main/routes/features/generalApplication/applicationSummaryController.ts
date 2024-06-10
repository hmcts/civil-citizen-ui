import config from 'config';
import { NextFunction, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { GA_APPLICATION_SUMMARY_URL, GA_VIEW_APPLICATION_URL } from 'routes/urls';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { GeneralApplicationClient } from 'client/generalApplicationClient';
import { t } from 'i18next';
import { ApplicationState, ApplicationStatus, ApplicationSummary, StatusColor } from 'common/models/generalApplication/applicationSummary';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';

const applicationSummaryController = Router();
const viewPath = 'features/generalApplication/applications-summary';

const civilServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const civilServiceClient: GeneralApplicationClient = new GeneralApplicationClient(civilServiceApiBaseUrl);

applicationSummaryController.get(GA_APPLICATION_SUMMARY_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lng = req.query.lang || req.cookies.lang;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const applications = await civilServiceClient.getApplications(req);
    console.log('applications: ', applications);

    const applicationsRows: ApplicationSummary[] = [];
    applications.forEach(application => {
      const status = getApplicationStatus(application.state);
      applicationsRows.push({
        state: t(`PAGES.GENERAL_APPLICATION.SUMMARY.${application.state}`, {lng}),
        status: t(`PAGES.GENERAL_APPLICATION.SUMMARY.${status}`, {lng}),
        statusColor: StatusColor[status],
        types: application.data.applicationTypes,
        id: application.id,
        createdDate: application.createdDate,
        applicationUrl: `${constructResponseUrlWithIdParams(application.id, GA_VIEW_APPLICATION_URL)}?applicationId=${application.id}` 
      })
    });
    console.log('applicationsRows: ', applicationsRows);
    
    res.render(viewPath, {
      cancelUrl,
      applicationsRows,
      dashboardUrl: getCancelUrl(claimId, claim),
      pageTitle: 'PAGES.GENERAL_APPLICATION.SUMMARY.MY_APPLICATIONS',
    });
  } catch (error) {
    next(error);
  }
});

const getApplicationStatus = (status: ApplicationState): ApplicationStatus => {
  switch (status) {
    case ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION:
      return ApplicationStatus.IN_PROGRESS;
    case ApplicationState.AWAITING_RESPONDENT_RESPONSE:
      return ApplicationStatus.IN_PROGRESS;
    case ApplicationState.AWAITING_APPLICATION_PAYMENT:
      return ApplicationStatus.TO_DO;
  }
};

export default applicationSummaryController;
