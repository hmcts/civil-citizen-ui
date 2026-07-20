import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {LIFT_BREATHING_SPACE_CONFIRMATION_URL} from '../../../../../main/routes/urls';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Lift Breathing Space Confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return lift breathing space confirmation page', async () => {
      await request(app)
        .get(LIFT_BREATHING_SPACE_CONFIRMATION_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Breathing space lifted');
          expect(res.text).toContain('Case number:');
          expect(res.text).toContain('We have sent you a confirmation email.');
          expect(res.text).toContain('Return to your case summary');
        });
    });
  });
});
