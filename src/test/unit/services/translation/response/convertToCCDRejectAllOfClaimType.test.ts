import {Claim} from "models/claim";
import {RejectAllOfClaimType} from "form/models/rejectAllOfClaimType";
import {CCDRejectAllOfClaimType} from "models/ccdResponse/ccdRejectAllOfClaimType";
import {RejectAllOfClaim} from "form/models/rejectAllOfClaim";
import {toCCDRejectAllOfClaimType} from "services/translation/response/convertToCCDRejectAllOfClaimType";

describe('translate RejectAllOfClaimType to CCD model', () => {

  it('should return HAS_PAID_THE_AMOUNT_CLAIMED', () => {
    const claim = new Claim();
    claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
    const rejectAlOfClaimTypeResponseCCD = toCCDRejectAllOfClaimType(claim.rejectAllOfClaim.option);
    expect(rejectAlOfClaimTypeResponseCCD).toBe(CCDRejectAllOfClaimType.HAS_PAID_THE_AMOUNT_CLAIMED);
  });

  it('should return DISPUTES_THE_CLAIM', () => {
    const claim = new Claim();
    claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
    const rejectAlOfClaimTypeResponseCCD = toCCDRejectAllOfClaimType(claim.rejectAllOfClaim.option);
    expect(rejectAlOfClaimTypeResponseCCD).toBe(CCDRejectAllOfClaimType.DISPUTES_THE_CLAIM);
  });

  it('should return undefined', () => {
    const claim = new Claim();
    claim.rejectAllOfClaim = new RejectAllOfClaim('test');
    const rejectAlOfClaimTypeResponseCCD = toCCDRejectAllOfClaimType(claim.rejectAllOfClaim.option);
    expect(rejectAlOfClaimTypeResponseCCD).toBe(undefined);
  });
});
