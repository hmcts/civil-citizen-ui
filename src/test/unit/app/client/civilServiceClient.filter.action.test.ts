import { CivilServiceClient } from 'client/civilServiceClient';
import { DashboardNotification } from 'models/dashboard/dashboardNotification';
import { AppRequest } from 'common/models/AppRequest';

describe('CivilServiceClient.filterDashboardNotificationItems', () => {
  let client: CivilServiceClient;
  let mockReq: AppRequest;

  beforeEach(() => {
    client = new CivilServiceClient('http://localhost');
    mockReq = {
      session: {
        user: {
          givenName: 'John',
          familyName: 'Doe',
        },
        issuedAt: 1000, // Session started at 1000 seconds (1,000,000 ms)
      },
    } as unknown as AppRequest;
  });

  const createNotification = (overrides: any = {}): DashboardNotification => {
    const notification = new DashboardNotification(
      '1', 'titleEn', 'titleCy', 'descEn', 'descCy',
      overrides.timeToLive ?? 'Click',
      undefined, undefined,
      overrides.createdAt ?? new Date(500000).toISOString(),
      undefined,
      overrides.clickedBy,
      overrides.clickedAt,
    );
    if (overrides.createdBy || overrides.actionPerformed || overrides.createdAt) {
      notification.notificationAction = {
        createdBy: overrides.createdBy,
        actionPerformed: overrides.actionPerformed ?? 'Click',
        createdAt: overrides.createdAt ?? new Date(500000).toISOString(),
      } as any;
    }
    return notification;
  };

  it('should NOT filter out notification when actionUser is NOT sessionUser', () => {
    const notification = createNotification({ createdBy: 'Jane Smith' });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(notification);
  });

  it('should NOT filter out notification when actionPerformed is NOT "Click"', () => {
    const notification = createNotification({ createdBy: 'John Doe', actionPerformed: 'View' });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(1);
  });

  it('should filter out notification when actionUser matches, action is Click, and timeToLive is "Click"', () => {
    const notification = createNotification({ createdBy: 'John Doe', actionPerformed: 'Click', timeToLive: 'Click' });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(0);
  });

  it('should filter out notification when actionUser matches, action is Click, timeToLive is "Session", and session started AFTER action', () => {
    // sessionStart = 1000s, actionPerformedTime = 500s. 1000 > 500, so it should be filtered out.
    const notification = createNotification({
      createdBy: 'John Doe',
      actionPerformed: 'Click',
      timeToLive: 'Session',
      createdAt: new Date(500 * 1000).toISOString(),
    });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(0);
  });

  it('should NOT filter out notification when actionUser matches, action is Click, timeToLive is "Session", and session started BEFORE action', () => {
    // sessionStart = 1000s, actionPerformedTime = 1500s. 1000 < 1500, so it should NOT be filtered out.
    const notification = createNotification({
      createdBy: 'John Doe',
      actionPerformed: 'Click',
      timeToLive: 'Session',
      createdAt: new Date(1500 * 1000).toISOString(),
    });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(1);
  });

  it('should NOT filter out notification when timeToLive is something else (e.g. "None")', () => {
    const notification = createNotification({ createdBy: 'John Doe', actionPerformed: 'Click', timeToLive: 'None' });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(1);
  });

  it('should handle missing notificationAction gracefully (should NOT filter out)', () => {
    const notification = new DashboardNotification('1', 'titleEn', 'titleCy', 'descEn', 'descCy', 'Click', undefined, undefined, undefined, undefined, undefined, undefined);
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(1);
  });
});
