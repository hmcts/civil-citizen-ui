import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  APPLY_HELP_WITH_FEES_REFERENCE, APPLY_HELP_WITH_FEES_START,
} from 'routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Apply for help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return resolving apply help fees page', async () => {
      await request(app)
        .get(APPLY_HELP_WITH_FEES_START)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Apply for Help with Fees (open in a new window)');
          expect(res.text).toContain('Hearing fee');
          expect(res.text).toContain('Apply for help with fees');
          expect(res.text).toContain('If you already have a help with fees reference number in relation to the claim issue fee or any application fees, you should not use this reference number for this application.');
          expect(res.text).toContain('Instead, you should make a new help');
          expect(res.text).toContain('During your application, you');
          expect(res.text).toContain('Once you have made your application, return');
        });
    });
  });

  describe('on POST', () => {

    it('should redirect to help with fee selection if continue', async () => {
      await request(app)
        .post(APPLY_HELP_WITH_FEES_START)
        .send()
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(APPLY_HELP_WITH_FEES_REFERENCE);
        });
    });
  });
});
