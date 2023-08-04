import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_DEFENDANT_AGE_URL,
  ELIGIBILITY_CLAIMANT_AGE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Defendant Eligibility Age Controller', () => {

  describe('on GET', () => {
    it('should render defendant age eligibility page successfully', async () => {
      await request(app).get(ELIGIBILITY_DEFENDANT_AGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you believe the person you’re claiming against is 18 or over?');
      });
    });

    it('should render defendant age eligibility page with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {eligibilityDefendantAge: YesNo.YES}};
      await request(app).get(ELIGIBILITY_DEFENDANT_AGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you believe the person you’re claiming against is 18 or over?');
      });
    });

    it('should render defendant age eligibility page when cookie for defendant eligibility does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_DEFENDANT_AGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you believe the person you’re claiming against is 18 or over?');
      });
    });
  });

  describe('on POST', () => {
    it('should render defendant age eligibility page', async () => {
      await request(app).post(ELIGIBILITY_DEFENDANT_AGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you believe the person you’re claiming against is 18 or over?');
      });
    });

    it('should redirect to not eligible page when age question radio selection is no', async () => {
      await request(app).post(ELIGIBILITY_DEFENDANT_AGE_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=under-18-defendant');
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_DEFENDANT_AGE_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_CLAIMANT_AGE_URL);
        expect(app.request.cookies.eligibility.eligibilityDefendantAge).toBe(YesNo.YES);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', singleDefendant: YesNo.NO}};
      await request(app).post(ELIGIBILITY_DEFENDANT_AGE_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.eligibilityDefendantAge).toBe(YesNo.NO);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });
  });
});
