import {Claim} from 'models/claim';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {CCDRejectAllOfClaimType} from 'models/ccdResponse/ccdRejectAllOfClaimType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {toCCDRejectAllOfClaimType} from 'services/translation/response/convertToCCDRejectAllOfClaimType';

describe('translate RejectAllOfClaimType to CCD model', () => {

  it('should return HAS_PAID_THE_AMOUNT_CLAIMED', () => {
    // Given
    const claim = new Claim();
    // When
    claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
    const rejectAlOfClaimTypeResponseCCD = toCCDRejectAllOfClaimType(claim.rejectAllOfClaim.option);
    // Then
    expect(rejectAlOfClaimTypeResponseCCD).toBe(CCDRejectAllOfClaimType.HAS_PAID_THE_AMOUNT_CLAIMED);
  });

  it('should return DISPUTES_THE_CLAIM', () => {
    // Given
    const claim = new Claim();
    // When
    claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
    const rejectAlOfClaimTypeResponseCCD = toCCDRejectAllOfClaimType(claim.rejectAllOfClaim.option);
    // Then
    expect(rejectAlOfClaimTypeResponseCCD).toBe(CCDRejectAllOfClaimType.DISPUTES_THE_CLAIM);
  });

  it('should return undefined', () => {
    // Given
    const claim = new Claim();
    // When
    claim.rejectAllOfClaim = new RejectAllOfClaim('test');
    const rejectAlOfClaimTypeResponseCCD = toCCDRejectAllOfClaimType(claim.rejectAllOfClaim.option);
    // Then
    expect(rejectAlOfClaimTypeResponseCCD).toBe(undefined);
  });
});
