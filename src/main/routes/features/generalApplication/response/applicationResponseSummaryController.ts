import config from 'config';
import { NextFunction, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { GA_APPLICATION_RESPONSE_SUMMARY_URL } from 'routes/urls';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { GaServiceClient } from 'client/gaServiceClient';
import { getClaimById } from 'modules/utilityService';
import { buildRespondentApplicationSummaryRow, isApplicationVisibleToRespondent } from 'services/features/generalApplication/response/generalApplicationResponseService';

const applicationSummaryController = Router();
const viewPath = 'features/generalApplication/applications-summary';

const generalApplicationServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const generalApplicationServiceClient: GaServiceClient = new GaServiceClient(generalApplicationServiceApiBaseUrl);

applicationSummaryController.get(GA_APPLICATION_RESPONSE_SUMMARY_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang || req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const applications = await generalApplicationServiceClient.getApplicationsByCaseId(claimId, req);
    const applicationsRows = applications
      .filter(isApplicationVisibleToRespondent)
      .map(buildRespondentApplicationSummaryRow(claimId, lng));
    
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