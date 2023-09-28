import {isCUIReleaseTwoEnabled} from '../../../../main/app/auth/launchdarkly/launchDarklyClient';
import * as DraftSoreClient from 'client/legacyDraftStoreClient';
import * as RedisDraftStoreClient  from 'modules/draft-store/draftStoreService';
import {getDraftClaimData} from 'services/dashboard/draftClaimService';
import config from 'config';
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('client/legacyDraftStoreClient');
jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');

const ocmcBaseUrl = config.get<string>('services.cmc.url');
const isReleaseTwo = isCUIReleaseTwoEnabled as jest.Mock;
const ocmcDraftClaimStore  = jest.spyOn(DraftSoreClient, 'getOcmcDraftClaims') ;
const redisDraftClaimStore = jest.spyOn(RedisDraftStoreClient, 'getCaseDataFromStore');
describe ('cui draft claim service', () => {
  beforeEach(
    () => {
      jest.resetAllMocks();
    });
  it('should return an ocmc draft claim when flag for release 2 is off', async ()=>{
    //Given
    isReleaseTwo.mockResolvedValue(false);
    //When
    await getDraftClaimData('userToken', 'userId');
    //Then
    expect(ocmcDraftClaimStore).toHaveBeenCalled();
    expect(redisDraftClaimStore).not.toHaveBeenCalled();
  });
  it('should return a redis draft claim when flag for release 2 is on ', async () =>{
    //Given
    isReleaseTwo.mockResolvedValue(true);
    //When
    await getDraftClaimData('userToken', 'userId');
    //Then
    expect(ocmcDraftClaimStore).not.toHaveBeenCalled();
    expect(redisDraftClaimStore).toHaveBeenCalled();
  });
  it('should return ocmc eligilibity page when flag for release2 is false', async () => {
    //Given
    isReleaseTwo.mockResolvedValue(false);
    //When
    const draftClaimData = await getDraftClaimData('userToken', 'userId');
    //Then
    expect(draftClaimData.claimCreationUrl).toContain(ocmcBaseUrl);
  });
  it('should not have ocmc eligibility page when flag for release2 is true', async () => {
    //Given
    isReleaseTwo.mockResolvedValue(true);
    //When
    const draftClaimData = await getDraftClaimData('userToken', 'userId');
    //Then
    expect(draftClaimData.claimCreationUrl).not.toContain(ocmcBaseUrl);
  });
});
