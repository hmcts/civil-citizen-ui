import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Reason} from 'form/models/claim/details/reason';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {CCDClaim} from 'models/civilClaimResponse';

describe('translate Claim Details to CUI model', () => {
  const ccdClaimMock = {
    detailsOfClaim: 'test detailsOfClaim to reason',
  };

  it('should return undefined if CCDClaim doesnt exist', () => {
    //Given
    const ccdClaimEmpty: CCDClaim = {};
    //When
    const claimDetailsResponseCUI = toCUIClaimDetails(ccdClaimEmpty);
    //Then
    expect(claimDetailsResponseCUI).toBe(undefined);
  });

  it('should translate Claim Details to CUI', () => {
    //Given
    const claimDetailsCUI = new ClaimDetails(new Reason('test detailsOfClaim to reason'));
    //When
    const claimDetailsResponseCUI = toCUIClaimDetails(ccdClaimMock);
    //Then
    expect(claimDetailsResponseCUI).toMatchObject(claimDetailsCUI);
  });
});
