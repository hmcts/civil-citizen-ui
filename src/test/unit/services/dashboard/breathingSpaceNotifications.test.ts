import { addBreathingSpaceNotifications } from 'services/dashboard/dashboardService';
import { DashboardNotificationList } from 'models/dashboard/dashboardNotificationList';
import { DashboardNotification } from 'models/dashboard/dashboardNotification';
import { Claim } from 'models/claim';

jest.mock('i18next', () => ({
  t: (key: string, options?: { breathingSpaceUrl?: string; lng?: string }) => {
    if (key === 'PAGES.DASHBOARD.BREATHING_SPACE.STANDARD_BS_DESCRIPTION') {
      return 'Case is in standard breathing space<br>Breathing space usually lasts for 60 days. <a href="{{breathingSpaceUrl}}" class="govuk-link">Lift breathing space</a> when you know it will end.';
    }
    if (key === 'PAGES.DASHBOARD.BREATHING_SPACE.MENTAL_HEALTH_BS_DESCRIPTION') {
      return `Case is in mental health crisis breathing space<br>This will remain in place until you <a href="${options?.breathingSpaceUrl}" class="govuk-link">lift breathing space</a>.`;
    }
    return key;
  },
}));

jest.mock('common/utils/urlFormatter', () => ({
  constructResponseUrlWithIdParams: (claimId: string, url: string) => `/case/${claimId}${url}`,
}));

describe('addBreathingSpaceNotifications', () => {
  let dashboardNotifications: DashboardNotificationList;
  let claim: Claim;
  const claimId = '1234567890123456';
  const lng = 'en';

  beforeEach(() => {
    dashboardNotifications = new DashboardNotificationList();
    dashboardNotifications.items = [
      new DashboardNotification(
        'existing-notification',
        'Existing Title',
        'Teitl Presennol',
        'Existing description',
        'Disgrifiad presennol',
        null,
        null,
        new Map(),
        new Date().toISOString(),
        null,
      ),
    ];
    claim = new Claim();
  });

  describe('when both breathing space flags are active', () => {
    it('should add both standard and mental health breathing space notifications', () => {
      claim.breathingSpaceActive = true;
      claim.breathingSpaceMentalHealthActive = true;

      addBreathingSpaceNotifications(dashboardNotifications, claim, claimId, lng);

      expect(dashboardNotifications.items).toHaveLength(3);
      expect(dashboardNotifications.items[0].id).toBe('bs-standard-notification');
      expect(dashboardNotifications.items[0].titleEn).toBe('Important');
      expect(dashboardNotifications.items[0].titleCy).toBe('Pwysig');
      expect(dashboardNotifications.items[1].id).toBe('bs-mental-health-notification');
      expect(dashboardNotifications.items[1].titleEn).toBe('Important');
      expect(dashboardNotifications.items[2].id).toBe('existing-notification');
    });
  });

  describe('when only standard breathing space is active', () => {
    it('should add only standard breathing space notification', () => {
      claim.breathingSpaceActive = true;
      claim.breathingSpaceMentalHealthActive = false;

      addBreathingSpaceNotifications(dashboardNotifications, claim, claimId, lng);

      expect(dashboardNotifications.items).toHaveLength(2);
      expect(dashboardNotifications.items[0].id).toBe('bs-standard-notification');
      expect(dashboardNotifications.items[1].id).toBe('existing-notification');
    });
  });

  describe('when only mental health breathing space is active', () => {
    it('should add only mental health breathing space notification', () => {
      claim.breathingSpaceActive = false;
      claim.breathingSpaceMentalHealthActive = true;

      addBreathingSpaceNotifications(dashboardNotifications, claim, claimId, lng);

      expect(dashboardNotifications.items).toHaveLength(2);
      expect(dashboardNotifications.items[0].id).toBe('bs-mental-health-notification');
      expect(dashboardNotifications.items[0].descriptionEn).toContain('/case/1234567890123456');
      expect(dashboardNotifications.items[1].id).toBe('existing-notification');
    });
  });

  describe('when neither breathing space flag is active', () => {
    it('should not add any breathing space notifications', () => {
      claim.breathingSpaceActive = false;
      claim.breathingSpaceMentalHealthActive = false;

      addBreathingSpaceNotifications(dashboardNotifications, claim, claimId, lng);

      expect(dashboardNotifications.items).toHaveLength(1);
      expect(dashboardNotifications.items[0].id).toBe('existing-notification');
    });
  });

  describe('when notifications items array is null', () => {
    it('should initialize items array and add breathing space notifications', () => {
      dashboardNotifications.items = null;
      claim.breathingSpaceActive = true;
      claim.breathingSpaceMentalHealthActive = true;

      addBreathingSpaceNotifications(dashboardNotifications, claim, claimId, lng);

      expect(dashboardNotifications.items).toBeDefined();
      expect(dashboardNotifications.items).toHaveLength(2);
      expect(dashboardNotifications.items[0].id).toBe('bs-standard-notification');
      expect(dashboardNotifications.items[1].id).toBe('bs-mental-health-notification');
    });
  });

  describe('notification content', () => {
    it('should contain correct titles for standard breathing space', () => {
      claim.breathingSpaceActive = true;

      addBreathingSpaceNotifications(dashboardNotifications, claim, claimId, lng);

      const standardNotification = dashboardNotifications.items[0];
      expect(standardNotification.titleEn).toBe('Important');
      expect(standardNotification.titleCy).toBe('Pwysig');
    });

    it('should contain link in mental health notification description', () => {
      claim.breathingSpaceMentalHealthActive = true;

      addBreathingSpaceNotifications(dashboardNotifications, claim, claimId, lng);

      const mentalHealthNotification = dashboardNotifications.items[0];
      expect(mentalHealthNotification.descriptionEn).toContain('lift breathing space');
      expect(mentalHealthNotification.descriptionEn).toContain(`/case/${claimId}`);
    });
  });
});
