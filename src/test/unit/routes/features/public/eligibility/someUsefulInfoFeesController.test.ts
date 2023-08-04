import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_INFORMATION_FEES_URL,
  ELIGIBILITY_APPLY_HELP_FEES_URL,
  ELIGIBILITY_APPLY_HELP_WITH_FEES_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';

describe('Some useful information about Help with Fees Controller', () => {

  describe('on GET', () => {
    it('should render Some info about Help with Fees page successfully', async () => {
      const res = await request(app).get(ELIGIBILITY_INFORMATION_FEES_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Some useful information about Help with Fees');
    });

    it('should render Some info about Help with Fees with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {someUsefulInfoFees: YesNo.YES}};
      const res = await request(app).get(ELIGIBILITY_INFORMATION_FEES_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Some useful information about Help with Fees');
    });

    it('should render Some info about Help with Fees view when someUsefulInfoFees cookie does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      const res = await request(app).get(ELIGIBILITY_INFORMATION_FEES_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Some useful information about Help with Fees');
    });
  });

  describe('on POST', () => {
    it('should show error if no option selected', async () => {
      const res = await request(app).post(ELIGIBILITY_INFORMATION_FEES_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Some useful information about Help with Fees');
      expect(res.text).toContain('There was a problem');
    });

    it('should redirect to Apply Help fees page if radio selection is yes', async () => {
      const res = await request(app).post(ELIGIBILITY_INFORMATION_FEES_URL).send({option: YesNo.YES});
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(ELIGIBILITY_APPLY_HELP_FEES_URL);
      expect(app.request.cookies.eligibility.someUsefulInfoFees).toBe(YesNo.YES);
    });

    it('should redirect and set cookie value if radio selection is no', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      const res = await request(app).post(ELIGIBILITY_INFORMATION_FEES_URL).send({option: YesNo.NO});
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(ELIGIBILITY_APPLY_HELP_WITH_FEES_URL);
      expect(app.request.cookies.eligibility.someUsefulInfoFees).toBe(YesNo.NO);
      expect(app.request.cookies.eligibility.foo).toBe('blah');
    });

    it('should redirect and update cookie value if radio selection is yes', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', someUsefulInfoFees: YesNo.YES}};
      const res = await request(app).post(ELIGIBILITY_INFORMATION_FEES_URL).send({option: YesNo.YES});
      expect(res.status).toBe(302);
      expect(app.request.cookies.eligibility.someUsefulInfoFees).toBe(YesNo.YES);
      expect(app.request.cookies.eligibility.foo).toBe('blah');
    });
  });
});
