import {CurrentVersion, FeeRange, FlatAmount} from '../../../../main/common/models/feeRange';

describe('Fee range', ()=>{
  it('should convert fee ranges to table items successfully', ()=>{
    //Given
    const feeRange = new FeeRange(500.01, 10000, new CurrentVersion(1, '', '', '', new FlatAmount(20000)));

    //When
    const tableItems = feeRange.formatFeeRangeToTableItem();

    //Then
    expect(tableItems.length).toBe(2);
    expect(tableItems[0].text).toBe('£500.01 to £10,000');
    expect(tableItems[1].text).toBe('£20,000');
  });
});
