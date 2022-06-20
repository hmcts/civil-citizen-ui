import config from 'config';
import {authenticator} from 'otplib';


describe('Service Authorisation Provider Client', () => {
  describe('TBC', ()=>{
    it('calculates one-time password', async () => {
      const s2sSecret = config.get<string>('services.serviceAuthProvider.cmcS2sSecret');
      const oneTimePassword = authenticator.generate(s2sSecret);
      console.log(`oneTimePassword: ${oneTimePassword}`);
    });
  });
});
