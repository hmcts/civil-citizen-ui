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
import { ApplicationSummary, StatusColor } from 'common/models/generalApplication/applicationSummary';
import { getClaimById } from 'modules/utilityService';
import {dateTimeFormat} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {ApplicationTypeOptionCcd} from 'models/generalApplication/applicationType';

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
    const applications = await generalApplicationServiceClient.getApplicationsByCaseId(claimId, req);

    const applicationsRows: ApplicationSummary[] = [];
    for (const application of applications) {
      const index = applications.indexOf(application);
      const status = getApplicationStatus(application.state);
      applicationsRows.push({
        state: t(`PAGES.GENERAL_APPLICATION.SUMMARY.STATES.${application.state}`, {lng}),
        status: t(`PAGES.GENERAL_APPLICATION.SUMMARY.${status}`, {lng}),
        statusColor: StatusColor[status],
        types: translateApplicationType(application.case_data?.applicationTypes, lng),
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

const translateApplicationType = (applicationType: any, lng: string) => {

  switch (applicationType) {
    case ApplicationTypeOptionCcd.ADJOURN_HEARING:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.ADJOURN_HEARING', {lng});
    case ApplicationTypeOptionCcd.AMEND_A_STMT_OF_CASE:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.AMEND_A_STMT_OF_CASE', {lng});
    case ApplicationTypeOptionCcd.EXTEND_TIME:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.EXTEND_TIME', {lng});
    case ApplicationTypeOptionCcd.OTHER:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.OTHER', {lng});
    case ApplicationTypeOptionCcd.OTHER_OPTION:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.OTHER_OPTION', {lng});
    case ApplicationTypeOptionCcd.RELIEF_FROM_SANCTIONS:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.RELIEF_FROM_SANCTIONS', {lng});
    case ApplicationTypeOptionCcd.SET_ASIDE_JUDGEMENT:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.SET_ASIDE_JUDGEMENT', {lng});
    case ApplicationTypeOptionCcd.SETTLE_BY_CONSENT:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.SETTLE_BY_CONSENT', {lng});
    case ApplicationTypeOptionCcd.STAY_THE_CLAIM:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.STAY_THE_CLAIM', {lng});
    case ApplicationTypeOptionCcd.STRIKE_OUT:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.STRIKE_OUT', {lng});
    case ApplicationTypeOptionCcd.SUMMARY_JUDGMENT:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.SUMMARY_JUDGMENT', {lng});
    case ApplicationTypeOptionCcd.UNLESS_ORDER:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.UNLESS_ORDER', {lng});
    case ApplicationTypeOptionCcd.VARY_ORDER:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.VARY_ORDER', {lng});
    case ApplicationTypeOptionCcd.VARY_PAYMENT_TERMS_OF_JUDGMENT:
      return t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.VARY_PAYMENT_TERMS_OF_JUDGMENT', {lng});
    default:
      return undefined;
  }
};

export default applicationSummaryController;
