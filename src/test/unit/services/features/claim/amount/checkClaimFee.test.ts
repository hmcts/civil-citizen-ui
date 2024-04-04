import {CivilServiceClient} from 'client/civilServiceClient';
import {checkIfClaimFeeHasChanged} from 'services/features/claim/amount/checkClaimFee';
import {mockClaim} from '../../../../../utils/mockClaim';
import *  as claimFeesService from '../../../../../../main/services/features/claim/amount/claimFeesService';
import {AppRequest} from 'models/AppRequest';
import {req} from '../../../../../utils/UserDetails';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/claim/amount/claimFeesService');
describe('Check claim fee is changed service', () => {
  it('Should return status true if claim fee is changed ', async () => {
    //Given
    const appReq = <AppRequest>req;
    appReq.params = {id: '12345'};
    const mockClaimFee = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };
    const claim = mockClaim;
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce(mockClaimFee);
    const spySave = jest.spyOn(claimFeesService, 'saveClaimFee');
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', claim, appReq);
    //Then
    expect(isClaimFeeChanged).toEqual(true);
    expect(spySave).toHaveBeenCalled();
  });

  it('Should return status false if claim fee is not changed ', async () => {
    //Given
    const appReq = <AppRequest>req;
    appReq.params = {id: '12345'};
    const mockClaimFee = {
      calculatedAmountInPence: 11500,
      code: '123',
      version: 1,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce(mockClaimFee);
    const spySave = jest.spyOn(claimFeesService, 'saveClaimFee');
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', mockClaim, appReq);
    //Then
    expect(isClaimFeeChanged).toEqual(false);
    expect(spySave).toHaveBeenCalled();
  });
});
