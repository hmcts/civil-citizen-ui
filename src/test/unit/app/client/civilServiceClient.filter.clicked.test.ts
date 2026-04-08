import { CivilServiceClient } from 'client/civilServiceClient';
import { DashboardNotification } from 'models/dashboard/dashboardNotification';
import { AppRequest } from 'common/models/AppRequest';

describe('CivilServiceClient.filterDashboardNotificationItems (clickedBy/clickedAt)', () => {
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
    // Only use new fields; do not set legacy notificationAction, so these tests validate the new path exclusively
    return new DashboardNotification(
      '1', 'titleEn', 'titleCy', 'descEn', 'descCy',
      overrides.timeToLive ?? 'Click',
      undefined, undefined,
      overrides.createdAt ?? new Date(500000).toISOString(), // default createdAt for completeness
      undefined,
      overrides.clickedBy,
      overrides.clickedAt,
    );
  };

  it('filters out when clickedBy matches sessionUser and TTL is Click', () => {
    const notification = createNotification({ clickedBy: 'John Doe', timeToLive: 'Click' });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(0);
  });

  it('filters out when clickedBy matches, TTL Session, and session started AFTER clickedAt', () => {
    const notification = createNotification({
      clickedBy: 'John Doe',
      clickedAt: new Date(500 * 1000).toISOString(),
      timeToLive: 'Session',
    });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(0);
  });

  it('keeps when clickedBy matches, TTL Session, and session started BEFORE clickedAt', () => {
    const notification = createNotification({
      clickedBy: 'John Doe',
      clickedAt: new Date(1500 * 1000).toISOString(),
      timeToLive: 'Session',
    });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(1);
  });

  it('keeps when clickedBy is different user', () => {
    const notification = createNotification({ clickedBy: 'Jane Smith', timeToLive: 'Click' });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(1);
  });

  it('keeps when TTL is neither Click nor Session', () => {
    const notification = createNotification({ clickedBy: 'John Doe', timeToLive: 'None' });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(1);
  });

  it('keeps when there is no click (no clickedBy and no clickedAt)', () => {
    const notification = createNotification({ timeToLive: 'Click' });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(1);
  });

  it('treats createdBy comparison case-insensitively (clickedBy new path)', () => {
    const notification = createNotification({ clickedBy: 'john doe', timeToLive: 'Click' });
    const result = client.filterDashboardNotificationItems([notification], mockReq);
    expect(result).toHaveLength(0);
  });
});
