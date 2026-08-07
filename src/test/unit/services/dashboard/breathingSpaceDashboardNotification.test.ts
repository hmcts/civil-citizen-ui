import {Claim} from 'models/claim';
import {BreathingSpaceEnterInfo} from 'models/breathingSpace/breathingSpaceEnterInfo';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {
  buildClaimantBreathingSpaceNotification,
  buildDefendantBreathingSpaceNotification,
} from 'services/dashboard/breathingSpaceDashboardNotification';

jest.mock('i18next', () => ({
  t: (key: string, options?: {liftLink?: string}) => {
    if (options?.liftLink) {
      return `${key} ${options.liftLink}`;
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
});
