import {analyseClaimType, claimType} from 'form/models/claimType';

describe('Testing of claimType class', () => {
  test('should analyseClaimType as small claim', () => {
    // when
    const result =  analyseClaimType(1000 );
    // Then
    expect(result).toBe(claimType.SMALL_CLAIM);
  });

  test('should analyseClaimType as fast track', () => {
    // when
    const result =  analyseClaimType(20000 );
    // Then
    expect(result).toBe(claimType.FAST_TRACK_CLAIM);
  });

  test('should analyseClaimType as multi track', () => {
    // when
    const result =  analyseClaimType(110000, true );
    // Then
    expect(result).toBe(claimType.MULTI_TRACK);
  });
});
