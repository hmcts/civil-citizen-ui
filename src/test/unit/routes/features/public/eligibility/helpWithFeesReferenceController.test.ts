import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_HELP_WITH_FEES_REFERENCE,
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE,
  ELIGIBILITY_HWF_ELIGIBLE,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Help With Fees Reference Controller', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render help with fees reference eligibility page successfully', async () => {
      await request(app).get(ELIGIBILITY_HELP_WITH_FEES_REFERENCE).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you have a Help With Fees reference number?');
      });
    });

    it('should renderhelp with fees reference eligibility with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {hwfReference: YesNo.YES}};
      await request(app).get(ELIGIBILITY_HELP_WITH_FEES_REFERENCE).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you have a Help With Fees reference number?');
      });
    });

    it('should render help with fees reference eligibility view when cookie for helpWithFeesReference does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_HELP_WITH_FEES_REFERENCE).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you have a Help With Fees reference number?');
      });
    });
  });

  describe('on POST', () => {
    it('should render help with fees reference eligibility controller page', async () => {
      await request(app).post(ELIGIBILITY_HELP_WITH_FEES_REFERENCE).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you have a Help With Fees reference number?');
      });
    });

    it('should redirect to hwf eligible if address question radio selection is no', async () => {
      await request(app).post(ELIGIBILITY_HELP_WITH_FEES_REFERENCE).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_HWF_ELIGIBLE);
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_HELP_WITH_FEES_REFERENCE).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_HWF_ELIGIBLE_REFERENCE);
        expect(app.request.cookies.eligibility.hwfReference).toBe(YesNo.YES);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', hwfReference: YesNo.NO}};
      await request(app).post(ELIGIBILITY_HELP_WITH_FEES_REFERENCE).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.hwfReference).toBe(YesNo.NO);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });
  });
});
