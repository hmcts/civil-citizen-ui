import {
  isUsablePathSegment,
  MissingPathSegmentError,
  MissingPaymentReferenceError,
  normalizeRouteParam,
  requirePathSegment,
} from 'common/utils/routeParamUtils';

describe('routeParamUtils', () => {
  describe('normalizeRouteParam', () => {
    it('returns the first array segment', () => {
      expect(normalizeRouteParam(['abc', 'def'])).toEqual('abc');
    });

    it('maps missing values to an empty string', () => {
      expect(normalizeRouteParam(undefined)).toEqual('');
    });
  });

  describe('isUsablePathSegment', () => {
    it.each([
      [undefined],
      [null],
      [''],
      ['   '],
      ['undefined'],
      ['UNDEFINED'],
      ['null'],
      ['NULL'],
    ])('returns false for %p', (value) => {
      expect(isUsablePathSegment(value as string)).toBe(false);
    });

    it('returns true for a PayHub payment reference', () => {
      expect(isUsablePathSegment('RC-1701-0909-0602-0418')).toBe(true);
    });
  });

  describe('requirePathSegment', () => {
    it('returns a trimmed usable segment', () => {
      expect(requirePathSegment(' RC-1701-0909-0602-0418 ', 'paymentReference'))
        .toEqual('RC-1701-0909-0602-0418');
    });

    it('throws MissingPaymentReferenceError for an unusable payment reference', () => {
      expect(() => requirePathSegment('undefined', 'paymentReference'))
        .toThrow(MissingPaymentReferenceError);
    });

    it('throws MissingPathSegmentError for other missing segments', () => {
      expect(() => requirePathSegment(undefined, 'claimId')).toThrow(MissingPathSegmentError);
    });
  });
});
