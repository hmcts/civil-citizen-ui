import {Dashboard} from 'models/dashboard/dashboard';
import {ApplicantOrRespondent, ClaimantOrDefendant} from 'models/partyType';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {
  objectToMap, populateDashboardValues,
  replaceDashboardPlaceholders,
} from 'services/dashboard/dashboardInterpolationService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {t} from 'i18next';
import {
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
import {APPLICATION_TYPE_URL, GA_SUBMIT_OFFLINE, QM_START_URL} from 'routes/urls';
import {
  isCuiGaNroEnabled,
  isGaForLipsEnabled,
  isGaForLipsEnabledAndLocationWhiteListed,
  isGaForWelshEnabled,
  isQueryManagementEnabled,
} from '../../app/auth/launchdarkly/launchDarklyClient';
import {LinKFromValues} from 'models/generalApplication/applicationType';
import {isGaOnline} from 'services/commons/generalApplicationHelper';
import {CaseState} from 'form/models/claimDetails';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const CARM_DASHBOARD_EXCLUSIONS = Array.of(new DashboardTaskList('Mediation', 'Mediation', []));
const GA_DASHBOARD_EXCLUSIONS = Array.of(new DashboardTaskList('Applications', 'Applications', []));
const GA_DASHBOARD_EXCLUSIONS_QM = Array.of(new DashboardTaskList('Applications and messages to the court', 'Applications and messages to the court', []));
const QMLIP_DASHBOARD_EXCLUSIONS = Array.of(
  new DashboardTaskList('Applications to the court', '', []),
  new DashboardTaskList('Messages to the court', '', []));

export const getDashboardForm = async (caseRole: ClaimantOrDefendant, claim: Claim, claimId: string, req: AppRequest, isCarmApplicable = false, isGAFlagEnable = false): Promise<Dashboard> => {
  const queryManagementFlagEnabled = await isQueryManagementEnabled(claim.submittedDate);
  const isNroForGaLip = await isCuiGaNroEnabled();
  const welshGaEnabled = await isGaForWelshEnabled();
  const dashboard = await civilServiceClient.retrieveDashboard(claimId, caseRole, req);

  if (dashboard) {
    //remove application and messages to the court sections
    dashboard.items = dashboard.items.filter(item => !GA_DASHBOARD_EXCLUSIONS_QM.some(exclude => exclude['categoryEn'] === item['categoryEn']));
    if (queryManagementFlagEnabled) {
      //remove Applications sections
      dashboard.items = dashboard.items.filter(item => !GA_DASHBOARD_EXCLUSIONS.some(exclude => exclude['categoryEn'] === item['categoryEn']));
    }
    else { // prod code
      //remove QM sections
      dashboard.items = dashboard.items.filter(item => !QMLIP_DASHBOARD_EXCLUSIONS.some(exclude => exclude['categoryEn'] === item['categoryEn']));
      const isEACourt = await isGaForLipsEnabledAndLocationWhiteListed(claim?.caseManagementLocation?.baseLocation);

      const isGaOnlineFlag = isGaOnline(claim, isEACourt, welshGaEnabled, isNroForGaLip); // check if ga is online or offline

      if (!isGaOnlineFlag.isGaOnline) {
        dashboard.items = dashboard.items.filter(item => !GA_DASHBOARD_EXCLUSIONS.some(exclude => exclude['categoryEn'] === item['categoryEn']));
      } else {
        if (isGaOnlineFlag.isSettledOrDiscontinuedWithPreviousCCDState){ // in the case that all the application's tasklist are inactive with isSettledOrDiscontinuedWithPreviousCCDState
          const taskItem = dashboard
            .items
            .find(item => item.categoryEn === 'Applications')
            .tasks.find(task => task
              .taskNameEn.includes('Contact the court to request a change to my case')
              && task.statusEn === 'Inactive');
          if (taskItem) {
            taskItem.statusEn = 'Optional';
            taskItem.statusCy = 'Dewisol';
            taskItem.taskNameEn = '<a href={GENERAL_APPLICATIONS_INITIATION_PAGE_URL} rel="noopener noreferrer" class="govuk-link">Contact the court to request a change to my case</a>'.trim();
            taskItem.taskNameCy = '<a href={GENERAL_APPLICATIONS_INITIATION_PAGE_URL} rel="noopener noreferrer" class="govuk-link">Cysylltu â’r llys i wneud cais am newid i fy achos</a>'.trim();

          }
        }
      }
    }

    //exclude Carm sections
    if (!isCarmApplicable){
      dashboard.items = dashboard.items.filter(item => !CARM_DASHBOARD_EXCLUSIONS.some(exclude => exclude['categoryEn'] === item['categoryEn']));
    }

    const mappedValues = await populateDashboardValues(claim, claimId);
    for (const item of dashboard.items) {
      for (const task of item.tasks) {
        task.taskNameEn = await replaceDashboardPlaceholders(task.taskNameEn, mappedValues);
        task.taskNameCy = await replaceDashboardPlaceholders(task.taskNameCy, mappedValues);
        task.hintTextEn = await replaceDashboardPlaceholders(task.hintTextEn, mappedValues);
        task.hintTextCy = await replaceDashboardPlaceholders(task.hintTextCy, mappedValues);
      }
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
    const mappedValues = await populateDashboardValues(claim, claimId);
    for (const notification of dashboardNotifications.items) {
      notification.descriptionEn = await replaceDashboardPlaceholders(notification.descriptionEn, mappedValues);
      notification.descriptionCy = await replaceDashboardPlaceholders(notification.descriptionCy, mappedValues);
    }
    for (const [gaRef, value] of applicantNotifications) {
      for (const notification of value.items) {
        notification.descriptionEn = await replaceDashboardPlaceholders(notification.descriptionEn, mappedValues);
        notification.descriptionCy = await replaceDashboardPlaceholders(notification.descriptionCy, mappedValues);
      }
      dashboardNotifications.items.push(...(value?.items ?? []));
    }
    for (const [gaRef, value] of respondentNotifications) {
      for (const notification of value.items) {
        notification.descriptionEn = await replaceDashboardPlaceholders(notification.descriptionEn, mappedValues);
        notification.descriptionCy = await replaceDashboardPlaceholders(notification.descriptionCy, mappedValues);
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

export const getContactCourtLink = async (claimId: string, claim: Claim, isGAFlagEnable: boolean, lng: string): Promise<iWantToLinks> => {

  const isLIPQmOn = await isQueryManagementEnabled(claim.submittedDate);
  const isNroForGaLip = await isCuiGaNroEnabled();

  if (isLIPQmOn) {
    const isClaimOffLine = [CaseState.PENDING_CASE_ISSUED, CaseState.CASE_DISMISSED, CaseState.PROCEEDS_IN_HERITAGE_SYSTEM];
    if(!isClaimOffLine.includes(claim.ccdState)){
      return {
        text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_APPLY_COURT', {lng}),
        url: constructResponseUrlWithIdParams(claimId, QM_START_URL + `?linkFrom=${LinKFromValues.start}`),
        removeTargetBlank: true,
      };
    }
  } else { // Prod code
    const isEACourt = await isGaForLipsEnabledAndLocationWhiteListed(claim?.caseManagementLocation?.baseLocation);
    const welshGaEnabled = await isGaForWelshEnabled();
    const isGaOnlineFlag = isGaOnline(claim, isEACourt, welshGaEnabled, isNroForGaLip); // check if ga is online or offline
    if (isGaOnlineFlag.isGaOnline) {
      return {
        text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT', {lng}),
        url: constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}`),
        removeTargetBlank: true,
      };
    } else { // ga is offline
      if (isGaOnlineFlag.isGAWelsh) { // the GA is offline and user is bilingual
        return {
          text: t('PAGES.DASHBOARD.SUPPORT_LINKS.CONTACT_COURT', {lng}),
          url: constructResponseUrlWithIdParams(claimId, GA_SUBMIT_OFFLINE),
        };
      }
    }
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
