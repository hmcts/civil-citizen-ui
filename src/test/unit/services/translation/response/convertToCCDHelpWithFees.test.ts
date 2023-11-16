import {CCDHelpWithFees} from 'form/models/claimDetails';
import {toCCDHelpWithFees} from 'services/translation/response/convertToCCDHelpWithFees';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';

describe('translate HWF to CCD model', () => {
  it('should return undefined if HWF doesnt exist', () => {
    //given
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    const expected: CCDHelpWithFees = undefined;
    //When
    const helpWithFees = toCCDHelpWithFees(claim.claimDetails?.helpWithFees);
    //then
    expect(helpWithFees).toEqual(expected);
  });

  it('should return undefined if HWF exist', () => {
    //given
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.helpWithFees = new HelpWithFees(YesNo.YES, '1111');
    const expected: CCDHelpWithFees = {
      helpWithFee: YesNoUpperCamelCase.YES,
      helpWithFeesReferenceNumber: '1111',
    };
    //When
    const helpWithFees = toCCDHelpWithFees(claim.claimDetails?.helpWithFees);
    //then
    expect(helpWithFees).toEqual(expected);
  });
});
