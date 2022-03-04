import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {RESPONSE_TYPE_URL} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');


describe('Citizen response type', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('should return citizen response type page', async () => {
      await request(app)
        .get(RESPONSE_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How do you respond to the claim?');
        });
    });
  });

  describe('on POST', () => {
    test('should return error on incorrect input', async () => {
      await request(app)
        .post(RESPONSE_TYPE_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Choose your response');
        });
    });

    test('should redirect page when correct input', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(RESPONSE_TYPE_URL)
        .send('responseType=test')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
  });
});
