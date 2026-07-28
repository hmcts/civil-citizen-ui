import {t} from 'i18next';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';

const BODY_HTML = (lng: string) =>
  `<p class="govuk-body">${t('PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.DEFENDANT_CONTENT', {lng})}</p>`;

export const buildDefendantBreathingSpaceNotification = (): DashboardNotification => {
  return new DashboardNotification(
    'breathing-space-defendant',
    t('PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.TITLE', {lng: 'en'}),
    t('PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.TITLE', {lng: 'cy'}),
    BODY_HTML('en'),
    BODY_HTML('cy'),
    '',
    undefined,
    undefined,
    new Date().toISOString(),
    undefined,
  );
};
