import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  QM_CONFIRMATION_URL,
} from 'routes/urls';

jest.mock('../../../../../main/modules/oidc');

const CONTROLLER_URL = QM_CONFIRMATION_URL;
describe('Query management Confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('on GET', () => {
    it('should return query management confirmation page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Message sent');
          expect(res.text).toContain('Your message has been sent to the court');
          expect(res.text).toContain('What happens next');
          expect(res.text).toContain('Our team will read your message and try to respond within 10 working days.');
          expect(res.text).toContain('You will be notified when the court responds to your message and you will be able to view it from your dashboard.');
          expect(res.text).toContain('Go to your dashboard');
        });
    });
  });
});
