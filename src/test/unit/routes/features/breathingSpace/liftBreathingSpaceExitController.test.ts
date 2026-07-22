import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {LIFT_BREATHING_SPACE_EXIT_URL, LIFT_BREATHING_SPACE_URL, DASHBOARD_URL} from '../../../../../main/routes/urls';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Lift Breathing Space Exit Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return lift breathing space exit page', async () => {
      await request(app)
        .get(LIFT_BREATHING_SPACE_EXIT_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you sure you want to exit this journey?');
          expect(res.text).toContain('All answers will be lost, and breathing space will not be lifted');
          expect(res.text).toContain('Yes');
          expect(res.text).toContain('No');
        });
    });
  });

  describe('on POST', () => {
    it('should return exit page with error when no option selected', async () => {
      await request(app)
        .post(LIFT_BREATHING_SPACE_EXIT_URL.replace(':id', '123'))
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Select yes if you want to exit this journey');
          expect(res.text).toContain('There is a problem');
        });
    });

    it('should redirect to returnUrl when option is no', async () => {
      const returnUrl = LIFT_BREATHING_SPACE_URL.replace(':id', '123');
      await request(app)
        .post(LIFT_BREATHING_SPACE_EXIT_URL.replace(':id', '123'))
        .send({option: 'no', returnUrl})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain(returnUrl);
        });
    });

    it('should redirect to dashboard when option is yes', async () => {
      await request(app)
        .post(LIFT_BREATHING_SPACE_EXIT_URL.replace(':id', '123'))
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain(DASHBOARD_URL);
        });
    });
  });
});
