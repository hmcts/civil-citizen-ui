import {CourtOrder} from 'form/models/statementOfMeans/courtOrders/courtOrder';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';

describe('CourtOrders model', () => {
  describe('fromObject', () => {
    it('should return undefined when input is not provided', () => {
      expect(CourtOrders.fromObject(undefined)).toBeUndefined();
    });

    it('should map declared true and convert rows to CourtOrder instances', () => {
      const payload = {
        declared: 'yes',
        rows: [
          {amount: '100', instalmentAmount: '5', claimNumber: ' CN001 '},
          {amount: '250.25', instalmentAmount: '10.5', claimNumber: 'CN002'},
        ],
      } as unknown as Record<string, object>;

      const result = CourtOrders.fromObject(payload);

      expect(result.declared).toBe(true);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual(new CourtOrder(100, 5, 'CN001'));
      expect(result.rows[1]).toEqual(new CourtOrder(250.25, 10.5, 'CN002'));
    });

    it('should set rows to empty array when declared is false', () => {
      const payload = {
        declared: 'no',
        rows: [
          {amount: '100', instalmentAmount: '5', claimNumber: 'CN001'},
        ],
      } as unknown as Record<string, object>;

      const result = CourtOrders.fromObject(payload);

      expect(result.declared).toBe(false);
      expect(result.rows).toEqual([]);
    });

    it('should set declared to undefined when value is not booleanable', () => {
      const payload = {
        declared: 'maybe',
        rows: [],
      } as unknown as Record<string, object>;

      const result = CourtOrders.fromObject(payload);

      expect(result.declared).toBeUndefined();
      expect(result.rows).toEqual([]);
    });
  });
});
