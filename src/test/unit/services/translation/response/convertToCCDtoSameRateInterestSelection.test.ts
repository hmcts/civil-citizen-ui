import {Claim} from '../../../../../main/common/models/claim';
import {Interest} from '../../../../../main/common/form/models/interest/interest';
import {toCCDSameRateInterestSelection} from '../../../../../main/services/translation/response/convertToCCDtoSameRateInterestSelection';
import {SameRateInterestType} from '../../../../../main/common/form/models/claimDetails';
import {CCDRepaymentPlanFrequency} from '../../../../../main/common/models/ccdResponse/ccdSameRateInterestSelection';

describe('translate InterestType to CCD model', () => {

  it('should return undefined', () => {
    const claim = new Claim();
    claim.interest = new Interest();
    const claimAmountResponseCCD = toCCDSameRateInterestSelection(claim.interest.sameRateInterestSelection);
    expect(claimAmountResponseCCD).toBe(undefined);
  });

  it('should return SAME_RATE_INTEREST_8_PC', () => {
    const claim = new Claim();
    claim.interest = new Interest();
    claim.interest.sameRateInterestSelection = { sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC }
    const claimAmountResponseCCD = toCCDSameRateInterestSelection(claim.interest.sameRateInterestSelection);
    expect(claimAmountResponseCCD).toMatchObject({
      sameRateInterestType: CCDRepaymentPlanFrequency.SAME_RATE_INTEREST_8_PC,
      differentRate: undefined,
      differentRateReason: undefined,
    });
  });

  it('should return object with SAME_RATE_INTEREST_DIFFERENT_RATE', () => {
    const claim = new Claim();
    claim.interest = new Interest();
    claim.interest.sameRateInterestSelection = {
      sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
      differentRate: 200,
      reason: 'test',
    }
    const claimAmountResponseCCD = toCCDSameRateInterestSelection(claim.interest.sameRateInterestSelection);
    expect(claimAmountResponseCCD).toMatchObject({
      sameRateInterestType: CCDRepaymentPlanFrequency.SAME_RATE_INTEREST_DIFFERENT_RATE,
      differentRate: 200,
      differentRateReason: 'test',
    });
  });
});
