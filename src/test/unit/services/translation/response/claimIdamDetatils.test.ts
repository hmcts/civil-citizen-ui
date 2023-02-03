import {getClaimantIdamDetails} from 'services/translation/response/claimantIdamDetails';
import {userInfo} from '../../../../utils/UserDetails';

describe('Get Claimant Idam Details', () => {

  it('should all values are ok', () => {
    const getClaimantIdamDetailsResponse = getClaimantIdamDetails(userInfo);
    expect(userInfo.id).toBe(getClaimantIdamDetailsResponse.id);
    expect(userInfo.email).toBe(getClaimantIdamDetailsResponse.email);
  });

});
