import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../main/app';
import {SIGN_OUT_URL} from '../../../../main/routes/urls';

describe('OIDC middleware', () => {
  describe('Sign out', () => {
    const citizenRoleToken: string = config.get('citizenRoleToken');
    const idamServiceUrl: string = config.get('services.idam.authorizationURL');
    const signOutUrl = idamServiceUrl.replace('/login', '/o/endSession');

    beforeEach(() => {
      nock(idamServiceUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.user = {
        idToken: 'token',
        givenName: 'Joe',
        familyName: 'Bloggs',
      };
    });

    it('should unset user', async () => {
      await request(app).get(SIGN_OUT_URL).expect(() => {
        expect(app.locals.user).toBeUndefined();
      });
    });

    it('should redirect to idam sign out', async () => {
      await request(app).get(SIGN_OUT_URL).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain(signOutUrl);
      });
    });
  });
});
