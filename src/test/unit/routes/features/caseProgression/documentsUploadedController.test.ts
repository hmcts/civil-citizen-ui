import request from 'supertest';
import {
  mockCivilClaim,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {CP_EVIDENCE_UPLOAD_SUBMISSION_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Documents uploaded controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render the page successfully', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app).get(CP_EVIDENCE_UPLOAD_SUBMISSION_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('Documents uploaded');
    });
  });

  it('should return 500 error page for redis failure', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CP_EVIDENCE_UPLOAD_SUBMISSION_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

});
