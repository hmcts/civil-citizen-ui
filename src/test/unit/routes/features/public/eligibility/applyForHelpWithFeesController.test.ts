import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_HELP_WITH_FEES,
  ELIGIBILITY_HELP_WITH_FEES_REFERENCE,
} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Some useful information about Help with Fees Controller', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render Some info about Help with Fees page successfully', async () => {
      const res = await request(app).get(ELIGIBILITY_HELP_WITH_FEES);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Apply For Help With Fees');
    });

    describe('on POST', () => {
      it('should redirect to Apply Help Fees Reference page', async () => {
        const res = await request(app).post(ELIGIBILITY_HELP_WITH_FEES);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_HELP_WITH_FEES_REFERENCE);
      });
    });
  });
});
