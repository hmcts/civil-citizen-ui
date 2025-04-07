import {Dashboard} from 'models/dashboard/dashboard';
import {ApplicantOrRespondent, ClaimantOrDefendant} from 'models/partyType';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {objectToMap, replaceDashboardPlaceholders} from 'services/dashboard/dashboardInterpolationService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {t} from 'i18next';
import {
  applicationNoticeUrl,
  feesHelpUrl,
  findCourtTribunalUrl,
  findLegalAdviceUrl,
  findOutMediationUrl,
  representYourselfUrl,
  whatToExpectUrl,
} from 'common/utils/externalURLs';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {iWantToLinks} from 'common/models/dashboard/iWantToLinks';
import {APPLICATION_TYPE_URL, GA_SUBMIT_OFFLINE} from 'routes/urls';
import {
  isGaForLipsEnabled,
  isGaForLipsEnabledAndLocationWhiteListed, isGaForWelshEnabled, isQueryManagementEnabled,
} from '../../app/auth/launchdarkly/launchDarklyClient';
import {LinKFromValues} from 'models/generalApplication/applicationType';
import {updateQueryManagementDashboardItems} from 'services/features/queryManagement/queryManagementService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const CARM_DASHBOARD_EXCLUSIONS = Array.of(new DashboardTaskList('Mediation', 'Mediation', []));
const GA_DASHBOARD_EXCLUSIONS = Array.of(new DashboardTaskList('Applications', 'Applications', []));

export const getDashboardForm = async (caseRole: ClaimantOrDefendant, claim: Claim, claimId: string, req: AppRequest, isCarmApplicable = false, isGAFlagEnable = false): Promise<Dashboard> => {
  const queryManagementFlagEnabled = await isQueryManagementEnabled(claim.issueDate);
  const welshGaEnabled = await isGaForWelshEnabled();

  const dashboard = await civilServiceClient.retrieveDashboard(claimId, caseRole, req);
  if (dashboard) {
    for (const item of dashboard.items) {
      for (const task of item.tasks) {
        task.taskNameEn = await replaceDashboardPlaceholders(task.taskNameEn, claim, claimId);
        task.taskNameCy = await replaceDashboardPlaceholders(task.taskNameCy, claim, claimId);
        task.hintTextEn = await replaceDashboardPlaceholders(task.hintTextEn, claim, claimId);
        task.hintTextCy = await replaceDashboardPlaceholders(task.hintTextCy, claim, claimId);
      }
    }
    //exclude Carm sections
    if (!isCarmApplicable){
      dashboard.items = dashboard.items.filter(item => !CARM_DASHBOARD_EXCLUSIONS.some(exclude => exclude['categoryEn'] === item['categoryEn']));
    }

    //exclude Applications sections
    if (!isGAFlagEnable
      || (claim.defendantUserDetails === undefined && !claim.isLRDefendant())
      || !await isGaForLipsEnabledAndLocationWhiteListed(claim?.caseManagementLocation?.baseLocation)
      || (claim.isAnyPartyBilingual() && !welshGaEnabled && claim.generalApplications.length === 0) || (claim.isLRDefendant() && !claim.respondentSolicitorDetails)) {
      dashboard.items = dashboard.items.filter(item => !GA_DASHBOARD_EXCLUSIONS.some(exclude => exclude['categoryEn'] === item['categoryEn']));
    } else if (queryManagementFlagEnabled) {
      updateQueryManagementDashboardItems(dashboard, GA_DASHBOARD_EXCLUSIONS[0], claim);
    }

    return dashboard;
  } else {
    throw new Error('Dashboard not found...');
  }
};

export const getNotifications = async (claimId: string, claim: Claim, caseRole: ClaimantOrDefendant, req: AppRequest, lng: string): Promise<DashboardNotificationList> => {
  const mainClaimNotificationIds: string[] = [];
  const dashboardNotifications = await civilServiceClient.retrieveNotification(claimId, caseRole, req);
  dashboardNotifications.items?.forEach(notification => mainClaimNotificationIds.push(notification.id));
  // Add notifications for all GAs
  const genAppsByRole = new Map<ApplicantOrRespondent, string[]>([[ApplicantOrRespondent.APPLICANT, []], [ApplicantOrRespondent.RESPONDENT, []]]);
  const isGaEnabled = await isGaForLipsEnabled();
  if (isGaEnabled) {
    for (const generalApplication of (claim.generalApplications ?? [])) {
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
  }
  const applicantNotifications = genAppsByRole.get(ApplicantOrRespondent.APPLICANT).length > 0
    ? await civilServiceClient.retrieveGaNotification(genAppsByRole.get(ApplicantOrRespondent.APPLICANT), ApplicantOrRespondent.APPLICANT, req)
    : new Map<string, DashboardNotificationList>();
  const respondentNotifications = genAppsByRole.get(ApplicantOrRespondent.RESPONDENT).length > 0
    ? await civilServiceClient.retrieveGaNotification(genAppsByRole.get(ApplicantOrRespondent.RESPONDENT), ApplicantOrRespondent.RESPONDENT, req)
    : new Map<string, DashboardNotificationList>();

  if (dashboardNotifications) {
    for (const notification of dashboardNotifications.items) {
      notification.descriptionEn = await replaceDashboardPlaceholders(notification.descriptionEn, claim, claimId, notification, lng);
      notification.descriptionCy = await replaceDashboardPlaceholders(notification.descriptionCy, claim, claimId, notification, lng);
    }
    for (const [gaRef, value] of applicantNotifications) {
      for (const notification of value.items) {
        notification.descriptionEn = await replaceDashboardPlaceholders(notification.descriptionEn, claim, claimId, notification, lng, gaRef);
        notification.descriptionCy = await replaceDashboardPlaceholders(notification.descriptionCy, claim, claimId, notification, lng, gaRef);
      }
      dashboardNotifications.items.push(...(value?.items ?? []));
    }
    for (const [gaRef, value] of respondentNotifications) {
      for (const notification of value.items) {
        notification.descriptionEn = await replaceDashboardPlaceholders(notification.descriptionEn, claim, claimId, notification, lng, gaRef);
        notification.descriptionCy = await replaceDashboardPlaceholders(notification.descriptionCy, claim, claimId, notification, lng, gaRef);
      }
      dashboardNotifications.items.push(...(value?.items ?? []));
    }
    sortDashboardNotifications(dashboardNotifications, mainClaimNotificationIds);
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

export const  getContactCourtLink = async (claimId: string, claim: Claim, isGAFlagEnable: boolean, lng: string, isGAlinkEnabled = false) : Promise<iWantToLinks> => {
  if ((claim.ccdState && isGAlinkEnabled || !claim.isCaseIssuedPending() && !claim.isClaimSettled()
    && (claim.defendantUserDetails !== undefined || (claim.isLRDefendant() && !!claim.respondentSolicitorDetails)) && await isGaForLipsEnabledAndLocationWhiteListed(claim?.caseManagementLocation?.baseLocation))) {
    const welshGaEnabled = await isGaForWelshEnabled();
    if (claim.isAnyPartyBilingual() && !welshGaEnabled) {
      return {
        text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT', {lng}),
        url: GA_SUBMIT_OFFLINE,
      };
    } else if (!claim.hasClaimTakenOffline() && isGAFlagEnable && isGAlinkEnabled || !claim.hasClaimBeenDismissed()) {
      return {
        text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT', {lng}),
        url: constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}`),
        removeTargetBlank: true,
      };
    } else if (isGAlinkEnabled || claim.hasClaimTakenOffline() || claim.hasClaimBeenDismissed()) {
      return {
        text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT', {lng}),
      };
    }
    return {
      text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT', { lng }),
      url: applicationNoticeUrl,
    };
  }
};

export const sortDashboardNotifications = (dashboardNotifications: DashboardNotificationList, mainClaimNotificationIds: string[]) => {
  dashboardNotifications.items?.sort((notification1, notification2) => {

    const priorityTitles = ['The case has been stayed', 'The stay has been lifted'];

    if (priorityTitles.includes(notification1.titleEn) && !priorityTitles.includes(notification2.titleEn)) {
      return -1;
    }
    if (priorityTitles.includes(notification2.titleEn) && !priorityTitles.includes(notification1.titleEn)) {
      return 1;
    }
    if (priorityTitles.includes(notification1.titleEn) && priorityTitles.includes(notification2.titleEn)) {
      return 0; // Maintain original order if both are priority titles
    }

    if (notification1.deadline) {
      if (!notification2.deadline) {
        // Only notification 1 has a deadline
        return -1;
      } else {
        // Both have deadlines, check for earliest
        return notification1.deadline.localeCompare(notification2.deadline);
      }
    }
    if (notification2.deadline) {
      // Only notification 2 has a deadline
      return 1;
    }
    if (mainClaimNotificationIds.includes(notification1.id)) {
      if (!mainClaimNotificationIds.includes(notification2.id)) {
        // Only notification 1 is for main claim
        return -1;
      } else {
        // Both are for main claim, check which was created last
        return -notification1.createdAt.localeCompare(notification2.createdAt);
      }
    }
    if (mainClaimNotificationIds.includes(notification2.id)) {
      // Only notification 2 is for main claim
      return 1;
    }
    // Both are GA notifications, check which was created last
    return -notification1.createdAt.localeCompare(notification2.createdAt);
  });
};
