import {CaseState} from 'common/form/models/claimDetails';
import {Claim} from 'common/models/claim';
import {NotificationBuilder} from 'common/utils/dashboard/notificationBuilder';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {NOTIFICATION_URL, PAY_HEARING_FEE_URL} from 'routes/urls';
import {DashboardNotification} from 'common/utils/dashboard/dashboardNotification';
import {ClaimantOrDefendant} from 'models/partyType';
import {getNotificationFromCache, saveNotificationToCache} from 'modules/draft-store/getDashboardCache';
import {Notifications} from 'models/caseProgression/notifications';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');

export const getClaimantNotifications = async (claim: Claim, lng: string) => {
  try {
    const cachedDashboardNotifications: Notifications = await getNotificationFromCache(ClaimantOrDefendant.CLAIMANT, claim.id.toString());
    if(cachedDashboardNotifications?.items?.length) {
      return cachedDashboardNotifications.items;
    }

    const dashboardNotificationsList: DashboardNotification[]  = [];
    const defendantName = claim.getDefendantFullName();
    const responseDeadline = claim.formattedResponseDeadline();
    const hearingDueDate = claim?.caseProgressionHearing?.hearingFeeInformation?.getHearingDueDateFormatted(lng);
    const feeAmount = claim?.caseProgressionHearing?.hearingFeeInformation?.getHearingFeeFormatted();

    const waitForDefendantResponseNotification = new NotificationBuilder(t('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND', {lng}))
      .addContent(new PageSectionBuilder()
        .addLink(t('PAGES.CLAIM_SUMMARY.VIEW_CLAIM', {lng}), NOTIFICATION_URL, t('PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND', { lng, defendantName, responseDeadline }),'','', true)
        .build())
      .build();

    const payTheHearingFee = new NotificationBuilder(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE', { lng }))
      .addContent(new PageSectionBuilder()
        .addLink(t('PAGES.DASHBOARD.NOTIFICATIONS.HEARINGS.TEXT', {lng}),PAY_HEARING_FEE_URL.replace(':id', claim.id),t('PAGES.DASHBOARD.NOTIFICATIONS.HEARINGS.TEXT_BEFORE',{lng}), t('PAGES.DASHBOARD.NOTIFICATIONS.HEARINGS.PAY_FEE', { lng, feeAmount, hearingDueDate } ))
        .build())
      .build();

    dashboardNotificationsList.push(waitForDefendantResponseNotification);
    if (claim?.caseProgressionHearing?.hearingFeeInformation?.hearingFee) {
      dashboardNotificationsList.push(payTheHearingFee);
    }
    await saveNotificationToCache(dashboardNotificationsList, ClaimantOrDefendant.CLAIMANT, claim.id.toString());
    return dashboardNotificationsList;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getDefendantNotifications = async (claim: Claim, lng: string) => {
  try {
    const cachedDashboardNotifications: Notifications = await getNotificationFromCache(ClaimantOrDefendant.DEFENDANT, claim.id.toString());
    if(cachedDashboardNotifications?.items?.length) {
      return cachedDashboardNotifications.items;
    }
    const dashboardNotificationsList = [];
    const responseDeadline = claim.formattedResponseDeadline();
    const remainingDays = claim.getRemainingDays();

    const youHaventRespondedNotification = new NotificationBuilder(t('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM'))
      .addContent(new PageSectionBuilder()
        .addLink(t('BUTTONS.RESPOND_TO_CLAIM'), '#', t('PAGES.LATEST_UPDATE_CONTENT.YOU_NEED_TO_RESPOND_BEFORE_DEADLINE',{ lng, responseDeadline, remainingDays }))
        .build())
      .build();

    if (claim.ccdState === CaseState.PENDING_CASE_ISSUED) {
      dashboardNotificationsList.push(youHaventRespondedNotification);
    }

    await saveNotificationToCache(dashboardNotificationsList, ClaimantOrDefendant.DEFENDANT, claim.id);
    return dashboardNotificationsList;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
