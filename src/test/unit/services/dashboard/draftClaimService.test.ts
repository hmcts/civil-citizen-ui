import * as RedisDraftStoreClient  from 'modules/draft-store/draftStoreService';
import {getDraftClaimData} from 'services/dashboard/draftClaimService';
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const redisDraftClaimStore = jest.spyOn(RedisDraftStoreClient, 'getCaseDataFromStore');
describe ('cui draft claim service', () => {
  beforeEach(
    () => {
      jest.resetAllMocks();
    });
  it('should return a redis draft claim', async () =>{
    //When
    await getDraftClaimData('userToken', 'userId');
    //Then
    expect(redisDraftClaimStore).toHaveBeenCalled();
  });
  it('should return local eligibility page', async () => {
    //When
    const draftClaimData = await getDraftClaimData('userToken', 'userId');
    //Then
    expect(draftClaimData.claimCreationUrl).toEqual('/eligibility');
  });
});
