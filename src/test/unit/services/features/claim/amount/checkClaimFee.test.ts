import {CivilServiceClient} from 'client/civilServiceClient';
import {checkIfClaimFeeHasChanged} from 'services/features/claim/amount/checkClaimFee';
import {mockClaim} from '../../../../../utils/mockClaim';
import nock from 'nock';
import config from 'config';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/services/features/claim/amount/claimFeesService');
const civilServiceUrl = config.get<string>('services.civilService.url');
describe('Check claim fee is changed service', () => {
  beforeEach(() => {
    nock(civilServiceUrl)
      .post('/fees/claim/calculate-interest')
      .reply(200, '100');
    nock(civilServiceUrl)
      .post('/fees/claim/interest')
      .reply(200, '100');
  });

  it('Should return status true if claim fee is changed ', async () => {
    //Given
    const mockClaimFee = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce(mockClaimFee);
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', <Claim> { ...mockClaim, isDraftClaim: () => true, hasInterest:()=> true, isInterestFromASpecificDate:()=> false }, undefined);
    //Then
    expect(isClaimFeeChanged).toEqual(true);
  });

  it('Should return status false if claim fee is not changed ', async () => {
    //Given
    const mockClaimFee = {
      calculatedAmountInPence: 11500,
      code: '123',
      version: 1,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce(mockClaimFee);
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', mockClaim, undefined);
    //Then
    expect(isClaimFeeChanged).toEqual(false);
  });
});
