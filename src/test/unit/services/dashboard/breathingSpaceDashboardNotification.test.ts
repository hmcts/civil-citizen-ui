import {Claim} from 'models/claim';
import {BreathingSpaceEnterInfo} from 'models/breathingSpace/breathingSpaceEnterInfo';
import {BreathingSpaceLiftInfo} from 'models/breathingSpace/breathingSpaceLiftInfo';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {
  buildClaimantBreathingSpaceNotification,
  buildDefendantBreathingSpaceNotification,
} from 'services/dashboard/breathingSpaceDashboardNotification';

jest.mock('i18next', () => ({
  t: (key: string, options?: {liftLink?: string; endDate?: string}) => {
    if (options?.liftLink) {
      return `${key} ${options.liftLink}`;
    }
    if (options?.endDate) {
      return `${key} ${options.endDate}`;
    }
    return key;
  },
}));

describe('breathingSpaceDashboardNotification', () => {
  it('should build Important banner with defendant content', () => {
    const notification = buildDefendantBreathingSpaceNotification();

    expect(notification.id).toEqual('breathing-space-defendant');
    expect(notification.titleEn).toEqual('PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.TITLE');
    expect(notification.descriptionEn).toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.DEFENDANT_CONTENT',
    );
    expect(notification.descriptionEn).toContain('govuk-body');
  });

  it('should build standard claimant banner with usually lasts text and lift link', () => {
    const claim = new Claim();
    claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.STANDARD);
    const liftUrl = '/dashboard/123/breathing-space/lift';

    const notification = buildClaimantBreathingSpaceNotification(claim, liftUrl);

    expect(notification.id).toEqual('breathing-space-claimant');
    expect(notification.titleEn).toEqual('PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.TITLE');
    expect(notification.descriptionEn).toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.CLAIMANT_CONTENT_STANDARD',
    );
    expect(notification.descriptionEn).toContain('<strong>');
    expect(notification.descriptionEn).toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.USUALLY_LASTS',
    );
    expect(notification.descriptionEn).toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.LIFT_STANDARD',
    );
    expect(notification.descriptionEn).toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.LIFT_LINK_TEXT_STANDARD',
    );
    expect(notification.descriptionEn).toContain(`href="${liftUrl}"`);
    expect(notification.descriptionEn).toContain('<a class="govuk-link"');
    expect(notification.descriptionEn).not.toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.CLAIMANT_CONTENT_MENTAL_HEALTH',
    );
  });

  it('should build mental health claimant banner without usually lasts text', () => {
    const claim = new Claim();
    claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.MENTAL_HEALTH);
    const liftUrl = '/dashboard/123/breathing-space/lift';

    const notification = buildClaimantBreathingSpaceNotification(claim, liftUrl);

    expect(notification.descriptionEn).toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.CLAIMANT_CONTENT_MENTAL_HEALTH',
    );
    expect(notification.descriptionEn).toContain('<strong>');
    expect(notification.descriptionEn).toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.LIFT_MENTAL_HEALTH',
    );
    expect(notification.descriptionEn).toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.LIFT_LINK_TEXT',
    );
    expect(notification.descriptionEn).not.toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.USUALLY_LASTS',
    );
    expect(notification.descriptionEn).toContain(`href="${liftUrl}"`);
    expect(notification.descriptionEn).toContain('<a class="govuk-link"');
  });

  it('should show the future end date and omit the lift link', () => {
    const claim = new Claim();
    const futureEnd = new Date(2099, 8, 10);
    claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.STANDARD);
    claim.liftBreathing = new BreathingSpaceLiftInfo(futureEnd);
    const liftUrl = '/dashboard/123/breathing-space/lift';

    const notification = buildClaimantBreathingSpaceNotification(claim, liftUrl);

    expect(notification.descriptionEn).toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.CLAIMANT_CONTENT_STANDARD',
    );
    expect(notification.descriptionEn).toContain(
      `PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.UNTIL ${formatDateToFullDate(futureEnd, 'en')}`,
    );
    expect(notification.descriptionEn).not.toContain(liftUrl);
    expect(notification.descriptionEn).not.toContain(
      'PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.LIFT_STANDARD',
    );
    expect(notification.descriptionCy).toContain(
      `PAGES.DASHBOARD.NOTIFICATIONS.BREATHING_SPACE.UNTIL ${formatDateToFullDate(futureEnd, 'cy')}`,
    );
  });
});
