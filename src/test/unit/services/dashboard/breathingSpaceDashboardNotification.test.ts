import {buildDefendantBreathingSpaceNotification} from 'services/dashboard/breathingSpaceDashboardNotification';

jest.mock('i18next', () => ({
  t: (key: string) => key,
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
});
