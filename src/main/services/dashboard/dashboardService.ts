import { Dashboard } from 'models/dashboard/dashboard';
import { ApplicantOrRespondent, ClaimantOrDefendant } from 'models/partyType';
import { DashboardNotificationList } from 'models/dashboard/dashboardNotificationList';
import { AppRequest } from 'models/AppRequest';
import { Claim } from 'models/claim';
import {
  objectToMap,
  replaceDashboardPlaceholders,
} from 'services/dashboard/dashboardInterpolationService';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import { DashboardTaskList } from 'models/dashboard/taskList/dashboardTaskList';
import { t } from 'i18next';
import {
  feesHelpUrl,
  findCourtTribunalUrl,
  findLegalAdviceUrl,
  findOutMediationUrl,
  representYourselfUrl,
  whatToExpectUrl,
} from 'common/utils/externalURLs';
import {YesNo} from 'form/models/yesNo';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const CARM_DASHBOARD_EXCLUSIONS = Array.of(new DashboardTaskList('Mediation', 'Mediation', []));
const GA_DASHBOARD_EXCLUSIONS = Array.of(new DashboardTaskList('Applications', 'Applications', []));

export const getDashboardForm = async (caseRole: ClaimantOrDefendant, claim: Claim, claimId: string, req: AppRequest, isCarmApplicable = false, isGAFlagEnable = false): Promise<Dashboard> => {
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

    //exclude Applications sections
    if (!isGAFlagEnable){
      dashboard.items = dashboard.items.filter(item => !GA_DASHBOARD_EXCLUSIONS.some(exclude => exclude['categoryEn'] === item['categoryEn']));
    }

    return dashboard;
  } else {
    throw new Error('Dashboard not found...');
  }
};

export const getNotifications = async (claimId: string, claim: Claim, caseRole: ClaimantOrDefendant, req: AppRequest, lng: string): Promise<DashboardNotificationList> => {
  const dashboardNotifications = await civilServiceClient.retrieveNotification(claimId, caseRole, req);
  // Add notifications for all GAs
  const genAppsByRole = new Map<ApplicantOrRespondent, string[]>([[ApplicantOrRespondent.APPLICANT, []], [ApplicantOrRespondent.RESPONDENT, []]]);
  for (const generalApplication of claim.generalApplications) {
    const gaReference = generalApplication.value?.caseLink?.CaseReference;
    const claimantIsApplicant = generalApplication.value?.parentClaimantIsApplicant;
    if (gaReference && claimantIsApplicant) {
      let gaRole: ApplicantOrRespondent;
      if (claimantIsApplicant === YesNo.YES) {
        gaRole = caseRole === ClaimantOrDefendant.CLAIMANT ? ApplicantOrRespondent.APPLICANT : ApplicantOrRespondent.RESPONDENT;
      } else {
        gaRole = caseRole === ClaimantOrDefendant.CLAIMANT ? ApplicantOrRespondent.RESPONDENT : ApplicantOrRespondent.APPLICANT;
      }
      genAppsByRole.get(gaRole).push(gaReference);
    }
  }
  const applicantNotifications = genAppsByRole.get(ApplicantOrRespondent.APPLICANT).length > 0
    ? await civilServiceClient.retrieveGaNotification(genAppsByRole.get(ApplicantOrRespondent.APPLICANT), ApplicantOrRespondent.APPLICANT, req)
    : null;
  const respondentNotifications = genAppsByRole.get(ApplicantOrRespondent.RESPONDENT).length > 0
    ? await civilServiceClient.retrieveGaNotification(genAppsByRole.get(ApplicantOrRespondent.RESPONDENT), ApplicantOrRespondent.RESPONDENT, req)
    : null;

  if (dashboardNotifications) {
    dashboardNotifications.items.forEach((notification) => {
      notification.descriptionEn = replaceDashboardPlaceholders(notification.descriptionEn, claim, claimId, notification, lng);
      notification.descriptionCy = replaceDashboardPlaceholders(notification.descriptionCy, claim, claimId, notification, lng);
    });
    applicantNotifications?.forEach((value, gaRef, map) => {
      value.items.forEach((notification) => {
        notification.descriptionEn = replaceDashboardPlaceholders(notification.descriptionEn, claim, claimId, notification, lng, gaRef);
      });
      dashboardNotifications.items.push(...(value?.items ?? []));
    });
    respondentNotifications?.forEach((value, gaRef, map) => {
      value.items.forEach((notification) => {
        notification.descriptionEn = replaceDashboardPlaceholders(notification.descriptionEn, claim, claimId, notification, lng, gaRef);
      });
      dashboardNotifications.items.push(...(value?.items ?? []));
    });
    return dashboardNotifications;
  } else {
    throw new Error('Notifications not found...');
  }
};

export const getHelpSupportTitle = (lng: string) => {
  return t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_SUPPORT', { lng });
};

export const getHelpSupportLinks = (lng: string) => {
  return [
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.HELP_FEES', { lng }), url: feesHelpUrl, newWindowHidden: true },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_MEDIATION', { lng }), url: findOutMediationUrl, newWindowHidden: true  },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.WHAT_EXPECT_HEARING', { lng }), url: whatToExpectUrl, newWindowHidden: true  },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.REPRESENT_MYSELF', { lng }), url: representYourselfUrl, newWindowHidden: true  },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_LEGAL_ADVICE', { lng }), url: findLegalAdviceUrl, newWindowHidden: true  },
    { text: t('PAGES.DASHBOARD.SUPPORT_LINKS.FIND_INFO_COURT', { lng }), url: findCourtTribunalUrl, newWindowHidden: true  },
  ];
};

export function extractOrderDocumentIdFromNotification (notificationsList: DashboardNotificationList) : string {
  for (const notification of notificationsList.items) {
    const paramMap: Map<string, object> = objectToMap(notification.params);
    if (paramMap) {
      const orderDocument = paramMap.get('orderDocument');
      if (orderDocument !== undefined && orderDocument !== null) {
        return orderDocument.toString();
      }
    }
  }
  return undefined;
}
