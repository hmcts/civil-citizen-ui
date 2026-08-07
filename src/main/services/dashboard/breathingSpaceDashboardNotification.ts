import {t} from 'i18next';
import {Claim} from 'models/claim';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';

const BODY_HTML = (lng: string) =>
  `<p class="govuk-body"><strong>${t('PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.DEFENDANT_CONTENT', {lng})}</strong></p>`;

const claimantBodyHtml = (claim: Claim, liftUrl: string, lng: string): string => {
  const isMentalHealth = claim.isMentalHealthBreathingSpace();
  const contentKey = isMentalHealth
    ? 'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.CLAIMANT_CONTENT_MENTAL_HEALTH'
    : 'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.CLAIMANT_CONTENT_STANDARD';
  const liftSentenceKey = isMentalHealth
    ? 'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.LIFT_MENTAL_HEALTH'
    : 'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.LIFT_STANDARD';
  const liftLinkTextKey = isMentalHealth
    ? 'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.LIFT_LINK_TEXT'
    : 'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.LIFT_LINK_TEXT_STANDARD';
  const liftLink = `<a class="govuk-link" href="${liftUrl}">${t(liftLinkTextKey, {lng})}</a>`;

  let html = `<p class="govuk-body"><strong>${t(contentKey, {lng})}</strong></p>`;
  if (!isMentalHealth) {
    html += `<p class="govuk-body">${t('PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.USUALLY_LASTS', {lng})}</p>`;
  }
  html += `<p class="govuk-body">${t(liftSentenceKey, {
    lng,
    liftLink,
    interpolation: {escapeValue: false},
  })}</p>`;
  return html;
};

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

export const buildClaimantBreathingSpaceNotification = (claim: Claim, liftUrl: string): DashboardNotification => {
  return new DashboardNotification(
    'breathing-space-claimant',
    t('PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.TITLE', {lng: 'en'}),
    t('PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.TITLE', {lng: 'cy'}),
    claimantBodyHtml(claim, liftUrl, 'en'),
    claimantBodyHtml(claim, liftUrl, 'cy'),
    '',
    undefined,
    undefined,
    new Date().toISOString(),
    undefined,
  );
};
