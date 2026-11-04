import {isDecimal, toNumberOrString, toNumberOrUndefined, toOptionalNumber} from 'common/utils/numberConverter';

describe('numberConverter', () => {
  describe('toNumberOrUndefined', () => {
    it('should return a number when value is numeric', () => {
      expect(toNumberOrUndefined('12.5')).toBe(12.5);
    });

    it('should return undefined when value is not numeric', () => {
      expect(toNumberOrUndefined('abc')).toBeUndefined();
    });

    it('should return undefined when value is undefined', () => {
      expect(toNumberOrUndefined(undefined)).toBeUndefined();
    });
  });

  describe('toOptionalNumber', () => {
    it('should return a number when value is numeric', () => {
      expect(toOptionalNumber('2024')).toBe(2024);
    });

    it('should return undefined when value is undefined', () => {
      expect(toOptionalNumber(undefined)).toBeUndefined();
    });

    it('should return undefined when value is null', () => {
      expect(toOptionalNumber(null as unknown as string)).toBeUndefined();
    });

    it('should return undefined when value is empty or whitespace', () => {
      expect(toOptionalNumber('')).toBeUndefined();
      expect(toOptionalNumber('   ')).toBeUndefined();
    });

    it('should return NaN when value is not numeric', () => {
      expect(toOptionalNumber('abc')).toBeNaN();
    });
  });

  describe('toNumberOrString', () => {
    it('should return a number when value is numeric', () => {
      expect(toNumberOrString('7')).toBe(7);
    });

    it('should return the original string when value is not numeric', () => {
      expect(toNumberOrString('abc')).toBe('abc');
    });
  });

  describe('isDecimal', () => {
    it('should return true for a decimal number', () => {
      expect(isDecimal(1.5)).toBe(true);
    });

    it('should return false for an integer', () => {
      expect(isDecimal(2)).toBe(false);
    });
  });
});
