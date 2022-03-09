import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_DISABILITY_URL} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Disability', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('should return citizen disability page', async () => {
      await request(app)
        .get(CITIZEN_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you disabled?');
        });
    });
  });

  test('should redirect page when correct input', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({data: {}})),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DISABILITY_URL)
      .send('responseType=test')
      .expect((res) => {
        expect(res.status).toBe(200);
      });
  });
});
