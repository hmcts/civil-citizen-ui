import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  ELIGIBILITY_CLAIM_VALUE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
} from '../../../../../main/routes/urls';

jest.mock('../../../../../main/modules/oidc');

describe('Response Deadline Options Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should render the page total amount', async () => {
      await request(app).get(ELIGIBILITY_CLAIM_VALUE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Total amount you&#39;re claiming');
      });
    });
  });

  describe('on POST', () => {
    it('should render error message when total amount is not selected', async () => {
      await request(app).post(ELIGIBILITY_CLAIM_VALUE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('There was a problem');
      });
    });

    it('should render not eligible page when radio over-25000 is selected', async () => {
      await request(app).post(ELIGIBILITY_CLAIM_VALUE_URL).send({ 'totalAmount': 'over-25000' }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=claim-value-over-25000');
      });
    });

    it('should render not eligible page when radio less-25000 is selected', async () => {
      await request(app).post(ELIGIBILITY_CLAIM_VALUE_URL).send({ 'totalAmount': 'less-25000' }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_SINGLE_DEFENDANT_URL);
      });
    });

    it('should render not eligible page when radio unknow is selected', async () => {
      await request(app).post(ELIGIBILITY_CLAIM_VALUE_URL).send({ 'totalAmount': 'unknow' }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=claim-value-not-known');
      });
    });
  });

});
