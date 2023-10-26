import {mockClaim} from '../../../../utils/mockClaim';
import {Claim} from 'models/claim';
import {toCCDClaimFee} from 'models/ccdResponse/ccdClaimFee';

describe('map claim fee info to ccd claim fee', () => {

  it('should map claim fee successfully when claim fee exists', () => {
    const ccdClaimFee = toCCDClaimFee(mockClaim.claimFee);
    expect('11500').toBe(ccdClaimFee.calculatedAmountInPence);
  });

  it('should not return value when claim fee does not exists', () => {
    const _mockClaim: Claim = new Claim();
    const ccdClaimFee = toCCDClaimFee(_mockClaim.claimFee);
    expect(undefined).toBe(ccdClaimFee);
  });

});
