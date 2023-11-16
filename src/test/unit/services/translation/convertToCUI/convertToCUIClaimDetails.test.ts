import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Reason} from 'form/models/claim/details/reason';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {CCDClaim} from 'models/civilClaimResponse';
import {HelpWithFees} from 'common/form/models/claim/details/helpWithFees';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {CCDHelpWithFees} from 'form/models/claimDetails';

describe('translate Claim Details to CUI model', () => {
  const ccdClaimMock : CCDClaim = {
    detailsOfClaim: 'test detailsOfClaim to reason',
    helpWithFees: <CCDHelpWithFees>{
      helpWithFee: YesNoUpperCamelCase.YES,
      helpWithFeesReferenceNumber: '12345',
    },
  };

  it('should return undefined if CCDClaim doesnt exist', () => {
    //Given
    const ccdClaimEmpty: CCDClaim = undefined;
    //When
    const claimDetailsResponseCUI = toCUIClaimDetails(ccdClaimEmpty);
    //Then
    expect(claimDetailsResponseCUI).toBe(undefined);
  });

  it('should translate Claim Details to CUI when HWF exists', () => {
    //Given
    const claimDetailsCUI = new ClaimDetails(new Reason('test detailsOfClaim to reason'));
    claimDetailsCUI.helpWithFees = new HelpWithFees(YesNo.YES, '12345');
    //When
    const claimDetailsResponseCUI = toCUIClaimDetails(ccdClaimMock);
    //Then
    expect(claimDetailsResponseCUI).toMatchObject(claimDetailsCUI);
  });

  it('should translate Claim Details to CUI when HWF doesnt exists', () => {
    //Given
    const claimDetailsCUI = new ClaimDetails(new Reason());
    claimDetailsCUI.helpWithFees = new HelpWithFees();
    const ccdClaimMock : CCDClaim = {
      detailsOfClaim: undefined,
      helpWithFees: <CCDHelpWithFees>{
        helpWithFee: undefined,
        helpWithFeesReferenceNumber: undefined,
      },
    };
    //When
    const claimDetailsResponseCUI = toCUIClaimDetails(ccdClaimMock);
    //Then
    expect(claimDetailsResponseCUI).toMatchObject(claimDetailsCUI);
  });
});
