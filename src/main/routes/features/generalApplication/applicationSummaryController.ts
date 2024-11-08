import config from 'config';
import { t } from 'i18next';
import { NextFunction, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { GA_APPLICATION_SUMMARY_URL } from 'routes/urls';
import {
  getApplicationCreatedDate,
  getApplicationStatus,
  getCancelUrl,
  getViewApplicationUrl,
} from 'services/features/generalApplication/generalApplicationService';
import { GaServiceClient } from 'client/gaServiceClient';
import {
  ApplicationSummary,
  StatusColor,
} from 'common/models/generalApplication/applicationSummary';
import { getClaimById } from 'modules/utilityService';
import { dateTimeFormat } from 'common/utils/dateUtils';
import { Claim } from 'models/claim';
import { CivilServiceClient } from 'client/civilServiceClient';
import { displayToEnumKey } from 'services/translation/convertToCUI/cuiTranslation';
import { YesNoUpperCamelCase } from 'form/models/yesNo';

const applicationSummaryController = Router();
const viewPath = 'features/generalApplication/applications-summary';

const generalApplicationServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const generalApplicationServiceClient: GaServiceClient = new GaServiceClient(generalApplicationServiceApiBaseUrl);
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

applicationSummaryController.get(GA_APPLICATION_SUMMARY_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang || req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const ccdClaim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
    const applications = await generalApplicationServiceClient.getApplicationsByCaseId(claimId, req) || [];

    const applicationsRows: ApplicationSummary[] = [];
    for (const application of applications) {
      const index = applications.indexOf(application);
      const isApplicant = application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.YES;
      const status = getApplicationStatus(isApplicant, application.state);
      const type = displayToEnumKey(application.case_data?.applicationTypes);
      applicationsRows.push({
        state: t(`PAGES.GENERAL_APPLICATION.SUMMARY.STATES.${application.state}`, {lng}),
        status: t(`PAGES.GENERAL_APPLICATION.SUMMARY.${status}`, {lng}),
        statusColor: StatusColor[status],
        types: t(`PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.${type}`, {lng}),
        id: application.id,
        createdDate: dateTimeFormat(getApplicationCreatedDate(ccdClaim, application.id), lng),
        applicationUrl: getViewApplicationUrl(claimId, claim, application,index),
      });
    }

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
