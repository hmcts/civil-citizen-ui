import {HowMuchContinueClaiming} from 'common/form/models/interest/howMuchContinueClaiming';
import {SameRateInterestType} from 'common/form/models/claimDetails';

describe('HowMuchContinueClaiming constructor', () => {
  it('should create a new instance of HowMuchContinueClaiming', async () => {
    //Given
    const option = SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE;
    const dailyInterestAmount = 10.5;

    //When
    const howMuchContinueClaiming = new HowMuchContinueClaiming(option, dailyInterestAmount);

    //Then
    expect(howMuchContinueClaiming).toBeDefined();
    expect(howMuchContinueClaiming.option).toEqual(option);
    expect(howMuchContinueClaiming.dailyInterestAmount).toEqual(dailyInterestAmount);
  });

  it('should create a new instance of HowMuchContinueClaiming with undefined values', async () => {
    //When
    const howMuchContinueClaiming = new HowMuchContinueClaiming();

    //Then
    expect(howMuchContinueClaiming).toBeDefined();
    expect(howMuchContinueClaiming.option).toBeUndefined();
    expect(howMuchContinueClaiming.dailyInterestAmount).toBeUndefined();
  });
});
