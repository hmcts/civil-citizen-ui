import {ClaimDetails} from '../../../../../main/common/form/models/claim/details/claimDetails';
import {Reason} from '../../../../../main/common/form/models/claim/details/reason';
import {toCUIClaimDetails} from '../../../../../main/services/translation/convertToCUI/convertToCUIClaimDetails';

describe('translate Claim Details to CUI model', () => {
  const ccdClaimMock = {
    detailsOfClaim: 'test detailsOfClaim to reason'
  }

  it('should return undefined if CCDClaim doesnt exist', () => {
    const ccdClaimDetailsEmpty = undefined;
    const claimDetailsResponseCUI = toCUIClaimDetails(ccdClaimDetailsEmpty);
    expect(claimDetailsResponseCUI).toBe(undefined);
  });

  it('should translate Claim Details to CUI', () => {
    const claimDetailsCUI = new ClaimDetails(new Reason("test detailsOfClaim to reason"));

    const claimDetailsResponseCUI = toCUIClaimDetails(ccdClaimMock);
    expect(claimDetailsResponseCUI).toMatchObject(claimDetailsCUI);
  });
});
