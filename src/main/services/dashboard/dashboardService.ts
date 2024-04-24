import {Dashboard} from 'models/dashboard/dashboard';
import {ClaimantOrDefendant} from 'models/partyType';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {replaceDashboardPlaceholders} from 'services/dashboard/dashboardInterpolationService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import { t } from 'i18next';
import { feesHelpUrl, findCourtTribunalUrl, findLegalAdviceUrl, findOutMediationUrl, representYourselfUrl, whatToExpectUrl } from 'common/utils/externalURLs';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const CARM_DASHBOARD_EXCLUSIONS = Array.of(new DashboardTaskList('Mediation', 'Mediation', []));

export const getDashboardForm = async (caseRole: ClaimantOrDefendant, claim: Claim, claimId: string, req: AppRequest, isCarmApplicable = false): Promise<Dashboard> => {
  const dashboard = await civilServiceClient.retrieveDashboard(claimId, caseRole, req);
  if (dashboard) {
    dashboard.items.forEach((taskList) => {
      taskList.tasks.forEach((task) => {
        task.taskNameEn = replaceDashboardPlaceholders(task.taskNameEn, claim, claimId);
        task.taskNameCy = replaceDashboardPlaceholders(task.taskNameCy, claim, claimId);
        task.hintTextEn = replaceDashboardPlaceholders(task.hintTextEn, claim, claimId);
        task.hintTextCy = replaceDashboardPlaceholders(task.hintTextCy, claim, claimId);
      });
    });
    //exclude Carm sections
    if (!isCarmApplicable){
      dashboard.items = dashboard.items.filter(item => !CARM_DASHBOARD_EXCLUSIONS.some(exclude => exclude['categoryEn'] === item['categoryEn']));
    }
    return dashboard;
  } else {
    throw new Error('Dashboard not found...');
  }
};

export const getNotifications = async (claimId: string, claim: Claim, caseRole: ClaimantOrDefendant, req: AppRequest): Promise<DashboardNotificationList> => {
  const dashboardNotifications = await civilServiceClient.retrieveNotification(claimId, caseRole, req);
  if (dashboardNotifications) {
    dashboardNotifications.items.forEach((notification) => {
      notification.descriptionEn = replaceDashboardPlaceholders(notification.descriptionEn, claim, claimId, notification.id);
      notification.descriptionCy = replaceDashboardPlaceholders(notification.descriptionCy, claim, claimId, notification.id);
    });
    return dashboardNotifications;
  } else {
    throw new Error('Notifications not found...');
  }
};

export const getHelpSupportTitle = (lng: string) => {
  return t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_SUPPORT', { lng });
}

export const getHelpSupportLinks = (lng: string) => {
  return [
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_FEES', { lng }), url: feesHelpUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_MEDIATION', { lng }), url: findOutMediationUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.WHAT_EXPECT_HEARING', { lng }), url: whatToExpectUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.REPRESENT_MYSELF', { lng }), url: representYourselfUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_LEGAL_ADVICE', { lng }), url: findLegalAdviceUrl },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_INFO_COURT', { lng }), url: findCourtTribunalUrl },
  ];
}
