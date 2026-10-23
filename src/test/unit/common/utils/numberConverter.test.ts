import {isDecimal, toNumberOrString, toNumberOrUndefined} from 'common/utils/numberConverter';

describe('numberConverter', () => {
  describe('toNumberOrUndefined', () => {
    it('should parse valid number strings', () => {
      expect(toNumberOrUndefined('12.5')).toEqual(12.5);
      expect(toNumberOrUndefined('0')).toEqual(0);
      expect(toNumberOrUndefined('-3')).toEqual(-3);
    });

    it('should return undefined for non-numeric strings', () => {
      expect(toNumberOrUndefined('abc')).toBeUndefined();
      expect(toNumberOrUndefined('')).toBeUndefined();
    });
  });

  describe('toNumberOrString', () => {
    it('should return number when parseable', () => {
      expect(toNumberOrString('42')).toEqual(42);
      expect(toNumberOrString('3.14')).toEqual(3.14);
    });

    it('should return original string when not parseable', () => {
      expect(toNumberOrString('not-a-number')).toEqual('not-a-number');
    });
  });

  describe('isDecimal', () => {
    it('should return true for decimal numbers', () => {
      expect(isDecimal(1.5)).toBe(true);
      expect(isDecimal(-2.25)).toBe(true);
    });

    it('should return false for integers', () => {
      expect(isDecimal(2)).toBe(false);
      expect(isDecimal(0)).toBe(false);
    });

    it('should return false for non-number values', () => {
      expect(isDecimal(NaN)).toBe(false);
      expect(isDecimal('1.5' as unknown as number)).toBe(false);
    });
  });
});
