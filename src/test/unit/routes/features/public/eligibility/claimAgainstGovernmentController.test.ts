import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
  ELIGIBILITY_DEFENDANT_AGE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';

describe('Claim Against Government Controller', () => {

  describe('on GET', () => {
    it('should render claim against government eligibility page successfully', async () => {
      await request(app).get(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are you claiming against a government department?');
      });
    });

    it('should render claim against government eligibility with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {governmentDepartment: YesNo.YES}};
      await request(app).get(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are you claiming against a government department?');
      });
    });

    it('should renderclaim against government eligibility view when cookie for defendant eligibility does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are you claiming against a government department?');
      });
    });
  });

  describe('on POST', () => {
    it('should render claim against government eligibility page ', async () => {
      await request(app).post(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are you claiming against a government department?');
      });
    });

    it('should redirect to not eligible page if address question radio selection is yes', async () => {
      await request(app).post(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL + '?reason=government-department');
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_DEFENDANT_AGE_URL);
        expect(app.request.cookies.eligibility.governmentDepartment).toBe(YesNo.NO);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', governmentDepartment: YesNo.YES}};
      await request(app).post(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.governmentDepartment).toBe(YesNo.YES);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });
  });
});
