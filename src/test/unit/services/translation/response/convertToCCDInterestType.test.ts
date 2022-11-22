import {Claim} from '../../../../../main/common/models/claim';
import {CCDInterestType} from '../../../../../main/common/models/ccdResponse/ccdInterestType';
import {InterestClaimOptionsType} from '../../../../../main/common/form/models/claim/interest/interestClaimOptionsType';
import {toCCDInterestType} from '../../../../../main/services/translation/response/convertToCCDInterestType';
import { Interest } from 'common/form/models/interest/interest';

describe('translate InterestType to CCD model', () => {

  it('should return BREAK_DOWN_INTEREST', () => {
    const claim = new Claim();
    claim.interest = new Interest();
    claim.interest.interestClaimOptions = InterestClaimOptionsType.BREAK_DOWN_INTEREST;
    const interestTypeResponseCCD = toCCDInterestType(claim.interest.interestClaimOptions);
    expect(interestTypeResponseCCD).toBe(CCDInterestType.BREAK_DOWN_INTEREST);
  });

  it('should return SAME_RATE_INTEREST', () => {
    const claim = new Claim();
    claim.interest = new Interest();
    claim.interest.interestClaimOptions = InterestClaimOptionsType.SAME_RATE_INTEREST;
    const interestTypeResponseCCD = toCCDInterestType(claim.interest.interestClaimOptions);
    expect(interestTypeResponseCCD).toBe(CCDInterestType.SAME_RATE_INTEREST);
  });
});
