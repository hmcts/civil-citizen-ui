import * as DraftSoreClient from 'client/legacyDraftStoreClient';
import * as RedisDraftStoreClient  from 'modules/draft-store/draftStoreService';
import {getDraftClaimData} from 'services/dashboard/draftClaimService';
import config from 'config';
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('client/legacyDraftStoreClient');

const ocmcBaseUrl = config.get<string>('services.cmc.url');
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
    it('should return eligibility page', async () => {
    //Given
    isReleaseTwo.mockResolvedValue(true);
    //When
    const draftClaimData = await getDraftClaimData('userToken', 'userId');
    //Then
    expect(draftClaimData.claimCreationUrl).not.toContain(ocmcBaseUrl);
  });
});
