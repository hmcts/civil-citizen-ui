import {
  getAdditionalPartyDetails,
} from 'models/ccdResponse/ccdAdditionalPartyDetails';
import {mockClaim} from '../../../../utils/mockClaim';
import {Claim} from 'models/claim';

describe('Get Claimant Additional Details', () => {

  it('should map claimant details successfully when applicant exists', () => {
    const getClaimantAdditionalDetailsResponse = getAdditionalPartyDetails(mockClaim.applicant1);
    expect('Mrs Jane Clark').toBe(getClaimantAdditionalDetailsResponse.contactPerson);
  });

  it('should not return value when applicant does not exists', () => {
    const _mockClaim: Claim = new Claim();
    const getClaimantAdditionalDetailsResponse = getAdditionalPartyDetails(_mockClaim.applicant1);
    expect(undefined).toBe(getClaimantAdditionalDetailsResponse);
  });
});
describe('Get Respondent Additional Details', () => {

  it('should map claimant details successfully when respondent exists', () => {
    const getRespondentAdditionalDetailsResponse = getAdditionalPartyDetails(mockClaim.respondent1);
    expect('Mrs Richards Mary').toBe(getRespondentAdditionalDetailsResponse.contactPerson);
  });

  it('should not return value when respondent does not exists', () => {
    const _mockClaim: Claim = new Claim();
    const getRespondentAdditionalDetailsResponse = getAdditionalPartyDetails(_mockClaim.respondent1);
    expect(undefined).toBe(getRespondentAdditionalDetailsResponse);
  });
});
