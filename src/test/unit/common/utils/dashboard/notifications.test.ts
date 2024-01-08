import {DashboardNotification} from 'common/utils/dashboard/dashboardNotification';
import {ClaimSummarySection} from 'common/form/models/claimSummarySection';

describe('Notifications constructor', () => {
  it('should create a new instance of Notifications', async () => {
    //Given
    const title = 'test';
    const content: ClaimSummarySection[] = [];
    //When
    const howMuchContinueClaiming = {title:title, content: content} as DashboardNotification;
    //Then
    expect(howMuchContinueClaiming).toBeDefined();
    expect(howMuchContinueClaiming.title).toEqual(title);
    expect(howMuchContinueClaiming.content).toEqual(content);
  });
});
