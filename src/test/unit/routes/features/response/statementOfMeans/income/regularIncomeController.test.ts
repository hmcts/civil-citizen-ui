import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_MONTHLY_INCOME_URL} from '../../../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../../../utils/mockDraftStore';

const {app} = require('../../../../../../../main/app');

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Regular Income Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    test('it should display page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_MONTHLY_INCOME_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('What regular income do you receive?');
        });
    });
  });
});
