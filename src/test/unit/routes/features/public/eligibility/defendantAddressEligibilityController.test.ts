import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from 'app';
import {
  ELIGIBILITY_DEFENDANT_ADDRESS_URL,
  ELIGIBILITY_CLAIM_TYPE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from 'routes/urls';
import {YesNo} from 'common/form/models/yesNo';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('Defendant Eligibility Address Controller', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render defendant address eligibility page successfully', async () => {
      await request(app).get(ELIGIBILITY_DEFENDANT_ADDRESS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Does the person or organisation you’re claiming against have a postal address in England or Wales?');
      });
    });

    it('should render defendant address eligibility with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {eligibleDefendantAddress: YesNo.YES}};
      await request(app).get(ELIGIBILITY_DEFENDANT_ADDRESS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Does the person or organisation you’re claiming against have a postal address in England or Wales?');
      });
    });

    it('should render defendant address eligibility view when cookie for defendant eligibility does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_DEFENDANT_ADDRESS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Does the person or organisation you’re claiming against have a postal address in England or Wales?');
      });
    });
  });

  describe('on POST', () => {
    it('should render single defendant controller page', async () => {
      await request(app).post(ELIGIBILITY_DEFENDANT_ADDRESS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Does the person or organisation you’re claiming against have a postal address in England or Wales?');
      });
    });

    it('should redirect to not eligible page if address question radio selection is no', async () => {
      await request(app).post(ELIGIBILITY_DEFENDANT_ADDRESS_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=defendant-address');
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_DEFENDANT_ADDRESS_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_CLAIM_TYPE_URL);
        expect(app.request.cookies.eligibility.eligibleDefendantAddress).toBe(YesNo.YES);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', singleDefendant: YesNo.NO}};
      await request(app).post(ELIGIBILITY_DEFENDANT_ADDRESS_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.eligibleDefendantAddress).toBe(YesNo.NO);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });
  });
});
