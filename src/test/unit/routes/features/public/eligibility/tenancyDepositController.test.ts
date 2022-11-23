import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../app';
import {
  ELIGIBILITY_TENANCY_DEPOSIT_URL,
  ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from 'routes/urls';
import {YesNo} from 'common/form/models/yesNo';
import {NotEligibleReason} from 'common/form/models/eligibility/NotEligibleReason';
import {constructUrlWithNotEligibleReason} from 'common/utils/urlFormatter';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('Tenancy Deposit Controller', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render claim against tenancy deposit eligibility page successfully', async () => {
      const res = await request(app).get(ELIGIBILITY_TENANCY_DEPOSIT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Is your claim for a tenancy deposit?');
    });

    it('should render claim against tenancy deposit with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {tenancyDeposit: YesNo.YES}};
      const res = await request(app).get(ELIGIBILITY_TENANCY_DEPOSIT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Is your claim for a tenancy deposit?');
    });

    it('should render claim against teancy deposit view when cookie for defendant eligibility does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      const res = await request(app).get(ELIGIBILITY_TENANCY_DEPOSIT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Is your claim for a tenancy deposit?');
    });
  });

  describe('on POST', () => {
    it('should render claim against tenancy deposit eligibility page ', async () => {
      const res = await request(app).post(ELIGIBILITY_TENANCY_DEPOSIT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Is your claim for a tenancy deposit?');
    });

    it('should redirect to not eligible page if radio selection is yes', async () => {
      const res = await request(app).post(ELIGIBILITY_TENANCY_DEPOSIT_URL).send({option: YesNo.YES});
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT));
    });

    it('should redirect and set cookie value if radio selection is no', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      const res = await request(app).post(ELIGIBILITY_TENANCY_DEPOSIT_URL).send({option: YesNo.NO});
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL);
      expect(app.request.cookies.eligibility.tenancyDeposit).toBe(YesNo.NO);
      expect(app.request.cookies.eligibility.foo).toBe('blah');
    });

    it('should redirect and update cookie value if radio selection is yes', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', tenancyDeposit: YesNo.YES}};
      const res = await request(app).post(ELIGIBILITY_TENANCY_DEPOSIT_URL).send({option: YesNo.YES});
      expect(res.status).toBe(302);
      expect(app.request.cookies.eligibility.tenancyDeposit).toBe(YesNo.YES);
      expect(app.request.cookies.eligibility.foo).toBe('blah');
    });
  });
});
