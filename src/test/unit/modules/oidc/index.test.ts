import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../main/app';
import {ASSIGN_CLAIM_URL, FIRST_CONTACT_SIGNPOSTING_URL, SIGN_IN_URL, SIGN_OUT_URL} from '../../../../main/routes/urls';

jest.mock('../../../../main/modules/draft-store');

const citizenRoleToken: string = config.get('citizenRoleToken');
const idamServiceUrl: string = config.get('services.idam.authorizationURL');
const signOutUrl = idamServiceUrl.replace('/login', '/o/endSession');
describe('OIDC middleware', () => {
  describe('Sign out', () => {
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
  describe('public pages', () => {
    it('should not redirect to login for first contact pages', async () => {
      await request(app).get(FIRST_CONTACT_SIGNPOSTING_URL).expect((res) => {
        expect(res.status).toBe(200);
      });
    });
  });
  describe('assign claim to defendant', () => {
    it('should save claim id and redirect to sign in url when user is not logged in', async () => {
      await request(app).get(ASSIGN_CLAIM_URL +'?id=1').expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain(SIGN_IN_URL);
      });
      expect(app.locals.assignClaimId).toBe('1');
    });
  });
});
