import {boolean, isBooleanable} from 'common/utils/boolean';

describe('boolean utils', () => {
  describe('isBooleanable', () => {
    it('should return true for boolean primitives', () => {
      expect(isBooleanable(true)).toBe(true);
      expect(isBooleanable(false)).toBe(true);
    });

    it('should return true for numeric 0 and 1', () => {
      expect(isBooleanable(0)).toBe(true);
      expect(isBooleanable(1)).toBe(true);
    });

    it('should return true for recognised string literals ignoring case and whitespace', () => {
      expect(isBooleanable(' YES ')).toBe(true);
      expect(isBooleanable('\tNo')).toBe(true);
    });

    it('should return false for unsupported values', () => {
      expect(isBooleanable(2)).toBe(false);
      expect(isBooleanable('maybe')).toBe(false);
      expect(isBooleanable(undefined)).toBe(false);
    });
  });

  describe('boolean', () => {
    it('should return primitive boolean as-is', () => {
      expect(boolean(true)).toBe(true);
      expect(boolean(false)).toBe(false);
    });

    it('should convert numeric values 0 and 1', () => {
      expect(boolean(0)).toBe(false);
      expect(boolean(1)).toBe(true);
    });

    it('should convert string literals in a case-insensitive manner', () => {
      expect(boolean('On')).toBe(true);
      expect(boolean('off')).toBe(false);
    });

    it('should throw when value cannot be converted', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => boolean('1 or 0' as any)).toThrow(TypeError);
    });
  });
});
