import {CaseState} from 'common/form/models/claimDetails';
import {Claim} from 'common/models/claim';
import {NotificationBuilder} from 'common/utils/dashboard/notificationBuilder';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {PAY_HEARING_FEE_URL, NOTIFICATION_URL} from 'routes/urls';
import {DashboardNotification} from 'common/utils/dashboard/dashboardNotification';

export const getClaimantNotifications = (claim: Claim, lng: string) => {
//TODO refactor to add try/catch and call getNotificationFromCache .... getNotificationFromCache
  const dashboardNotificationsList: DashboardNotification[]  = [];
  const defendantName = claim.getDefendantFullName();
  const responseDeadline = claim.formattedResponseDeadline();
  const feeAmount = claim?.claimFee; //TODO get the correct fee

  const waitForDefendantResponseNotification = new NotificationBuilder()
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND', {lng}))
    .addContent(new PageSectionBuilder()
      .addLink(t('PAGES.CLAIM_SUMMARY.VIEW_CLAIM', {lng}), NOTIFICATION_URL, t('PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND', { lng, defendantName, responseDeadline }),'','', true)
      .build())
    .build();

  const payTheHearingFee = new NotificationBuilder()
    .addTitle(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE', { lng }))
    .addContent(new PageSectionBuilder()
      .addLink(t('PAGES.DASHBOARD.NOTIFICATIONS.HEARINGS.TEXT', {lng}),PAY_HEARING_FEE_URL,t('PAGES.DASHBOARD.NOTIFICATIONS.HEARINGS.TEXT_BEFORE',{lng}), t('PAGES.DASHBOARD.NOTIFICATIONS.HEARINGS.PAY_FEE', { lng, feeAmount, responseDeadline } ))
      .build())
    .build();

  dashboardNotificationsList.push(waitForDefendantResponseNotification);
  dashboardNotificationsList.push(payTheHearingFee);

  return dashboardNotificationsList;
};

export const getDefendantNotifications = (claim: Claim, lng: string) => {
//TODO refactor to add try/catch and call getNotificationFromCache .....getNotificationFromCache
  const dashboardNotificationsList = [];
  const responseDeadline = claim.formattedResponseDeadline();
  const remainingDays = claim.getRemainingDays();

  const youHaventRespondedNotification = new NotificationBuilder()
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM'))
    .addContent(new PageSectionBuilder()
      .addLink(t('BUTTONS.RESPOND_TO_CLAIM'), '#', t('PAGES.LATEST_UPDATE_CONTENT.YOU_NEED_TO_RESPOND_BEFORE_DEADLINE',{ lng, responseDeadline, remainingDays }))
      .build())
    .build();

  if (claim.ccdState === CaseState.PENDING_CASE_ISSUED) {
    dashboardNotificationsList.push(youHaventRespondedNotification);
  }

  return dashboardNotificationsList;
};
