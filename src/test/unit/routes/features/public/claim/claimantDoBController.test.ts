import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');

describe('Claimant Date of Birth Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render date of birth page', async () => {
      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should render date of birth page with cookie value', async () => {
      app.request['cookies'] = {'claim_issue_journey': {claimantDoB: {day: 1, month: 11, year: 1999}}};
      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });
  });

  describe('on POST', () => {
    it('should render date of birth page if there are form errors', async () => {
      const res = await request(app).post(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should redirect to the claimant phone number page', async () => {
      const dob = {day: 2, month: 3, year: 1980};
      await request(app).post(CLAIMANT_DOB_URL).send(dob).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIMANT_PHONE_NUMBER_URL);
        expect(app.request.cookies.claim_issue_journey.claimantDoB).toStrictEqual(dob);
      });
    });
  });
});
