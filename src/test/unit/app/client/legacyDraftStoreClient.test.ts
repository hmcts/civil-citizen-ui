import {getOcmcDraftClaims} from '../../../../main/app/client/legacyDraftStoreClient';
import {generateServiceToken} from '../../../../main/app/client/serviceAuthProviderClient';
import axios from 'axios';


jest.mock('../../../../main/app/client/serviceAuthProviderClient');
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Legacy Draft Store Client', () => {

  beforeEach(() => {
    (generateServiceToken as jest.Mock).mockImplementation(() => { /* default implementation */
    });
    mockedAxios.create.mockReturnThis();
  });

  it('should return ocmc claim successfully', async () =>{
    //Given
    const data = require('../../../utils/mocks/ocmcDraftDataMock.json');
    mockedAxios.get.mockResolvedValue({data: data});
    //When
    const ocmcDraftClaim = await getOcmcDraftClaims('userToken');
    //Then
    expect(ocmcDraftClaim).not.toBeUndefined();
  });

  it('should throw error when retrieval of OCMC draft claims fails', async () => {
    //When
    (generateServiceToken as jest.Mock).mockImplementation(() => {
      throw new Error('Service Token Generation Error');
    });
    //Then
    await expect(getOcmcDraftClaims('userToken')).rejects.toThrow('Service Token Generation Error');
  });
});
