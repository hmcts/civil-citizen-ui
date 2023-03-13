import {AmountBreakdown} from 'common/form/models/claim/amount/amountBreakdown';

describe('AmountBreakdown', () => {

  let sut: AmountBreakdown; 
  
  beforeEach(() => {
    sut = new AmountBreakdown();
  });
  
  it('should return false when the total amount is greater than the maximum', async () => {
        
    //When
    const result = sut.isValidTotal();
  
    //Then
    expect(result).toBeFalsy();
  });
  
});

describe('AmountBreakdown', () => {
  describe('fromObject', () => {
    it('should return undefined when value is false', async () => {
      // GIVEN
      const value: any = null;

      // WHEN
      const result = AmountBreakdown.fromObject(value);

      // THEN
      expect(result).toBeUndefined();
    });
  });
});
