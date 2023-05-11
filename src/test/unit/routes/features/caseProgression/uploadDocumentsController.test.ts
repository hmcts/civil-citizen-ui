import request from 'supertest';
import {
  mockCivilClaim,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {CP_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Upload document- upload document controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render page successfully if cookie has correct values', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('Upload documents');
    });
  });

  it('should return 500 error page for redis failure', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

});
