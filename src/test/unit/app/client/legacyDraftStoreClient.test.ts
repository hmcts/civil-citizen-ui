import {getOcmcDraftClaims} from '../../../../main/app/client/legacyDraftStoreClient';
import {generateServiceToken} from '../../../../main/app/client/serviceAuthProviderClient';

jest.mock('../../../../main/app/client/serviceAuthProviderClient');

describe('Legacy Draft Store Client', () => {

  beforeEach(() => {
    (generateServiceToken as jest.Mock).mockImplementation(() => { /* default implementation */
    });
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
