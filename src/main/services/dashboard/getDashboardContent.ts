import {Claim} from 'common/models/claim';
import {NotificationBuilder} from 'common/utils/dashboard/notificationBuilder';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
export const getClaimantNotifications = (claim: Claim, lng: string) => {
  // TODO: this is a mock data
  const dashboardNotificationsList = [];
  const defendantName = claim.getDefendantFullName();
  const responseDeadline = claim.formattedResponseDeadline();
  const waitForDefendantResponseNotification = new NotificationBuilder()
    .addTitle(t('WAIT_DEFENDANT_TO_RESPOND', { lng }))
    .addContent(new PageSectionBuilder()
      .addLink('View Claim', '#', t('DEFENDANT_HAS_UNTIL_TO_RESPOND', { lng, defendantName, responseDeadline }))
      .build())
    .build();
  const waitForDefendantResponseNotification2 = new NotificationBuilder()
    .addTitle(t('WELSH_WAIT_DEFENDANT_TO_RESPOND', { lng }))
    .addContent(new PageSectionBuilder()
      .addLink('View Claim', '#', t('WELSH_DEFENDANT_HAS_UNTIL_TO_RESPOND', { lng, defendantName, responseDeadline }))
      .build())
    .build();

  dashboardNotificationsList.push(waitForDefendantResponseNotification);
  dashboardNotificationsList.push(waitForDefendantResponseNotification2);

  return dashboardNotificationsList;
};

