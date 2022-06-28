import Module from 'module';
import {getOcmcDraftClaims} from '../../../../main/app/client/legacyDraftStoreClient';

jest.mock('../../../../main/app/client/serviceAuthProviderClient', () => ({
  ...jest.requireActual('../../../../main/app/client/serviceAuthProviderClient') as Module,
  generateServiceToken: jest.fn(() => {throw new Error('Service Token Generation Error');}),
}));


describe('Legacy Draft Store Client', () => {
  it('should throw error when retrieval of OCMC draft claims fails', async () => {
    //Then
    await expect(
      getOcmcDraftClaims('userToken')).rejects.toThrow('Service Token Generation Error');
  });
});
