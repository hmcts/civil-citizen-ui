import {DashboardNotification} from 'models/dashboard/dashboardNotification';
describe('Notifications constructor', () => {
  it('should create a new instance of Notifications', async () => {
    //Given
    const title = 'test';
    const content = 'test';
    //When
    const howMuchContinueClaiming = {titleEn:title, titleCy: title,descriptionEn: content,descriptionCy: content} as DashboardNotification;
    //Then
    expect(howMuchContinueClaiming).toBeDefined();
    expect(howMuchContinueClaiming.titleEn).toEqual(title);
    expect(howMuchContinueClaiming.descriptionEn).toEqual(content);
  });
});
