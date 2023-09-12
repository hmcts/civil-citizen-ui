import {
  getAdditionalClaimantDetails,
  getAdditionalRespondentDetails
} from 'models/ccdResponse/ccdAdditionalPartyDetails';
import {mockClaim} from '../../../../utils/mockClaim';

describe('Get Claimant Additional Details', () => {

  it('should all values are ok', () => {
    const getClaimantAdditionalDetailsResponse = getAdditionalRespondentDetails(mockClaim);
    expect('Mrs Richards Mary').toBe(getClaimantAdditionalDetailsResponse.contactPerson);
  });

});
describe('Get Respondent Additional Details', () => {

  it('should all values are ok', () => {
    const getRespondentAdditionalDetailsResponse = getAdditionalClaimantDetails(mockClaim);
    expect('Mrs Jane Clark').toBe(getRespondentAdditionalDetailsResponse.contactPerson);
  });

});
