import {
  toAdditionalPartyDetails,
} from 'models/ccdResponse/ccdAdditionalPartyDetails';
import {mockClaim} from '../../../../utils/mockClaim';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {Address} from 'form/models/address';

describe('map party info to additional party details', () => {

  it('should map claimant details successfully when applicant exists', () => {
    const getClaimantAdditionalDetailsResponse = toAdditionalPartyDetails(mockClaim.applicant1);
    expect('Mrs Jane Clark').toBe(getClaimantAdditionalDetailsResponse.contactPerson);
  });

  it('should not return value when applicant does not exists', () => {
    const _mockClaim: Claim = new Claim();
    const getClaimantAdditionalDetailsResponse = toAdditionalPartyDetails(_mockClaim.applicant1);
    expect(undefined).toBe(getClaimantAdditionalDetailsResponse);
  });

  it('should not return value when applicant party details does not exists', () => {
    const _mockClaim: Claim = new Claim();
    _mockClaim.applicant1 = {
      type: PartyType.INDIVIDUAL,
    };
    const getClaimantAdditionalDetailsResponse = toAdditionalPartyDetails(_mockClaim.applicant1);
    expect(undefined).toBe(getClaimantAdditionalDetailsResponse.contactPerson);
  });

  it('should not return value when applicant contact person does not exists', () => {
    const _mockClaim: Claim = new Claim();
    _mockClaim.applicant1 = {
      dateOfBirth: {
        day: null,
        month: null,
        year: null,
      },
      partyDetails: {
        individualTitle: 'Mrs',
        individualLastName: 'Clark',
        individualFirstName: 'Jane',
        partyName: 'Mrs Jane Clark',
        primaryAddress: new Address(),
      },
      type: PartyType.INDIVIDUAL,
    };
    const getRespondentAdditionalDetailsResponse = toAdditionalPartyDetails(_mockClaim.applicant1);
    expect(undefined).toBe(getRespondentAdditionalDetailsResponse.contactPerson);
  });
});
