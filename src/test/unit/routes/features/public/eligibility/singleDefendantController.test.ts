import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_DEFENDANT_ADDRESS_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';

describe('Single Defendant Controller', () => {

  describe('on GET', () => {
    it('should render single defendant controller page', async () => {
      await request(app).get(ELIGIBILITY_SINGLE_DEFENDANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Is this claim against more than one person or organisation?');
      });
    });

    it('should render single defendant controller page with singleDefendant cookie value', async () => {
      app.request['cookies'] = {'eligibility': {singleDefendant: YesNo.YES}};
      await request(app).get(ELIGIBILITY_SINGLE_DEFENDANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Is this claim against more than one person or organisation?');
      });
    });

    it('should render single defendant controller page with if singleDefendant does not exist in the cookie', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_SINGLE_DEFENDANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Is this claim against more than one person or organisation?');
      });
    });
  });

  describe('on POST', () => {
    it('should render single defendant controller page', async () => {
      await request(app).post(ELIGIBILITY_SINGLE_DEFENDANT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Is this claim against more than one person or organisation?');
      });
    });

    it('should redirect to not eligible page if single radio selection is yes', async () => {
      await request(app).post(ELIGIBILITY_SINGLE_DEFENDANT_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=multiple-defendants');
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_SINGLE_DEFENDANT_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_DEFENDANT_ADDRESS_URL);
        expect(app.request.cookies.eligibility.singleDefendant).toBe(YesNo.NO);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', singleDefendant: YesNo.NO}};
      await request(app).post(ELIGIBILITY_SINGLE_DEFENDANT_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.singleDefendant).toBe(YesNo.YES);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });
  });
});
