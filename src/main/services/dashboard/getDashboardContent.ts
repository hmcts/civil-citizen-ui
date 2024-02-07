import {CaseState} from 'common/form/models/claimDetails';
import {Claim} from 'common/models/claim';
import {NotificationBuilder} from 'common/utils/dashboard/notificationBuilder';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {PaymentStatus} from 'models/PaymentDetails';
import {NOTIFICATION_URL, PAY_HEARING_FEE_URL} from 'routes/urls';
import {DashboardNotification} from 'common/utils/dashboard/dashboardNotification';
import {ClaimantOrDefendant} from 'models/partyType';
import {getNotificationFromCache, saveNotificationToCache} from 'modules/draft-store/getDashboardCache';
import {Notifications} from 'models/dashboard/dashboardNotification';

const success = 'Success';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardCache');

export const getClaimantNotifications = async (claimId: string, claim: Claim, lng: string) => {
  try {
    const cachedDashboardNotifications: Notifications = await getNotificationFromCache(ClaimantOrDefendant.CLAIMANT, claimId);

    const dashboardNotificationsList: DashboardNotification[]  = cachedDashboardNotifications.items;

    return dashboardNotificationsList;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getDefendantNotifications = async (claimId: string, claim: Claim, lng: string) => {
  try {
    const cachedDashboardNotifications: Notifications = await getNotificationFromCache(ClaimantOrDefendant.DEFENDANT, claimId);
    if(cachedDashboardNotifications?.items?.length  && !claim.hasCaseProgressionHearingDocuments()) {
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

    await saveNotificationToCache(dashboardNotificationsList, ClaimantOrDefendant.DEFENDANT, claimId);
    return dashboardNotificationsList;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
