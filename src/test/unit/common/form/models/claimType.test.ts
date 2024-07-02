import {analyseClaimType, claimType, isIntermediateTrack, isMultiTrack} from 'form/models/claimType';

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

  test('should analyseClaimType as intermediate track', () => {
    // when
    const result =  analyseClaimType(26000, true );
    // Then
    expect(result).toBe(claimType.INTERMEDIATE_TRACK_CLAIM);
  });

  test('should analyseClaimType as small track when minti on', () => {
    // when
    const result =  analyseClaimType(1000, true );
    // Then
    expect(result).toBe(claimType.SMALL_CLAIM);
  });

  test('should return true if is multiTrack when minti on', () => {
    // when
    const result =  isMultiTrack(150000, true );
    // Then
    expect(result).toBe(true);
  });

  test('should return false if is not multiTrack when minti on', () => {
    // when
    const result =  isMultiTrack(1000, true );
    // Then
    expect(result).toBe(false);
  });

  test('should return true if is intermediate track when minti on', () => {
    // when
    const result =  isIntermediateTrack(100000, true );
    // Then
    expect(result).toBe(true);
  });

  test('should return false if is not intermediate track when minti on', () => {
    // when
    const result =  isIntermediateTrack(10000, true );
    // Then
    expect(result).toBe(false);
  });

});
