import {ClaimAmountRow} from '../../../../../../../src/main/common/form/models/claim/amount/claimAmountRow';

describe('ClaimAmountRow', () => {
  let row: ClaimAmountRow;

  beforeEach(() => {
    row = new ClaimAmountRow();
  });

  describe('isAtleastOneFieldPopulated', () => {
    it('should return false when row is empty', async () => {
      expect(row.isAtLeastOneFieldPopulated()).toBe(false);
    });

    it('should return true when row has a reason', async () => {
      row.reason = 'Some reason';
      expect(row.isAtLeastOneFieldPopulated()).toBe(true);
    });

    it('should return true when row has an amount', async () => {
      row.amount = 123.45;
      expect(row.isAtLeastOneFieldPopulated()).toBe(true);
    });

    it('should return true when row has both reason and amount', async () => {
      row.reason = 'Some reason';
      row.amount = 123.45;
      expect(row.isAtLeastOneFieldPopulated()).toBe(true);
    });
  });
});

describe('ClaimAmountRow fromObject', () => {
  it('should return undefined if value is undefined', async () => {
    // Given
    const value: Record<string, string> = undefined;
  
    // When
    const result = ClaimAmountRow.fromObject(value);
  
    // Then
    expect(result).toBeUndefined();
  });
  
  it('should return a new ClaimAmountRow object with the given reason and amount', async () => {
    // Given
    const value: Record<string, string> = {
      reason: 'Medical expenses',
      amount: '1000',
    };
  
    // When
    const result = ClaimAmountRow.fromObject(value);
  
    // Then
    expect(result).toBeInstanceOf(ClaimAmountRow);
    expect(result.reason).toEqual('Medical expenses');
    expect(result.amount).toEqual(1000);
  });
});
  