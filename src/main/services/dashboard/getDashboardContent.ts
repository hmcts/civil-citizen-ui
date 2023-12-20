import {CaseState} from 'common/form/models/claimDetails';
import {Claim} from 'common/models/claim';
import {NotificationBuilder} from 'common/utils/dashboard/notificationBuilder';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {FeeType} from 'form/models/helpWithFees/feeType';

export const getClaimantNotifications = (claim: Claim, lng: string) => {

  const dashboardNotificationsList = [];
  const defendantName = claim.getDefendantFullName();
  const responseDeadline = claim.formattedResponseDeadline();

  const waitForDefendantResponseNotification = new NotificationBuilder()
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND', { lng }))
    .addContent(new PageSectionBuilder()
      .addLink('View Claim', '#', t('PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND', { lng, defendantName, responseDeadline }))
      .build())
    .build();

  const waitForDefendantResponseNotification2 = new NotificationBuilder()
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND', { lng }))
    .addContent(new PageSectionBuilder()
      .addLink('View Claim', '#', t('PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND', { lng, defendantName, responseDeadline }))
      .build())
    .build();

  if (claim.caseProgression?.helpFeeReferenceNumberForm?.referenceNumber) {

    const feeType = claim.caseProgression?.helpFeeReferenceNumberForm ? FeeType.HEARING : null;

    const helpWithFeesNotification = new NotificationBuilder()
      .addTitle(t('PAGES.DASHBOARD.NOTIFICATIONS.HELP_WITH_FEES.TITLE', { lng }))
      .addContent(new PageSectionBuilder()
        .addParagraph(t(`PAGES.DASHBOARD.NOTIFICATIONS.HELP_WITH_FEES.${feeType}_CONTENT`, { lng, feeType: feeType }))
        .build())
      .build();

    dashboardNotificationsList.push(helpWithFeesNotification);
  }

  dashboardNotificationsList.push(waitForDefendantResponseNotification);
  dashboardNotificationsList.push(waitForDefendantResponseNotification2);

  return dashboardNotificationsList;
};

export const getDefendantNotifications = (claim: Claim, lng: string) => {

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
