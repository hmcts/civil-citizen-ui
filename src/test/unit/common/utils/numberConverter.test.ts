import {isDecimal, toNumberOrString, toNumberOrUndefined, toOptionalNumber} from 'common/utils/numberConverter';

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
