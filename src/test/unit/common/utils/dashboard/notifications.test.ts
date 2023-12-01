import {Notifications} from 'common/utils/dashboard/notification';
import {ClaimSummarySection} from 'common/form/models/claimSummarySection';

describe('Notifications constructor', () => {
  it('should create a new instance of Notifications', async () => {
    //Given
    const title = 'test';
    const content: ClaimSummarySection[] = [];
    //When
    const howMuchContinueClaiming = new Notifications(title, content);
    //Then
    expect(howMuchContinueClaiming).toBeDefined();
    expect(howMuchContinueClaiming.title).toEqual(title);
    expect(howMuchContinueClaiming.content).toEqual(content);
  });
});
