import {Claim} from 'common/models/claim';
import {toCCDClaimAmount} from 'services/translation/response/convertToCCDClaimAmount';
import {CCDClaimAmountBreakup} from 'common/models/ccdResponse/ccdClaimAmountBreakup';

describe('translate Claim Amount to CCD model', () => {
  const claim = new Claim();
  claim.claimAmountBreakup = [
    { value: { claimAmount: '5000', claimReason: 'car' } },
    { value: { claimAmount: '1000', claimReason: 'roof' } },
  ];

  it('should return undefined if claimAmountBreakup doesnt exist', () => {
    const claimEmpty = new Claim();
    const claimAmountResponseCCD = toCCDClaimAmount(claimEmpty.claimAmountBreakup);
    expect(claimAmountResponseCCD).toBe(undefined);
  });

  it('should translate claimAmountBreakup to CCD', () => {
    const claimAmountCCD: CCDClaimAmountBreakup[] = [
      {
        id: '0',
        value: { claimAmount: '500000', claimReason: 'car' },
      },
      {
        id: '1',
        value: { claimAmount: '100000', claimReason: 'roof' },
      },
    ];
    const claimAmountResponseCCD = toCCDClaimAmount(claim.claimAmountBreakup);
    expect(claimAmountResponseCCD).toMatchObject(claimAmountCCD);
  });
});
