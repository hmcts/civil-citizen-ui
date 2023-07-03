import {CurrentVersion, FeeRange, FlatAmount, PercentageAmount} from 'models/feeRange';

describe('Fee range', ()=>{
  it('should convert fee ranges to table items successfully', ()=>{
    //Given
    const feeRange = new FeeRange(500.01, 1000, new CurrentVersion(1, '', '', '', new FlatAmount(70), new PercentageAmount(0)));

    //When
    const tableItems = feeRange.formatFeeRangeToTableItem('en');

    //Then
    expect(tableItems.length).toBe(2);
    expect(tableItems[0].text).toBe('£500.01 to £1,000');
    expect(tableItems[1].text).toBe('£70');
  });
});
