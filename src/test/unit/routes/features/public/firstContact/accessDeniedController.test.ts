import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  FIRST_CONTACT_ACCESS_DENIED_URL,
} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('First Contact Access Denied Controller', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render First Contact Access Denied page successfully', async () => {
      const res = await request(app).get(FIRST_CONTACT_ACCESS_DENIED_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('You are not authorised to view the claim!');
    });
  });
});
