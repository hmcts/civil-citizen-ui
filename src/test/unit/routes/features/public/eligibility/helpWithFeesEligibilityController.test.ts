import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_HELP_WITH_FEES_URL,
  ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from 'routes/urls';
import {YesNo} from '.common/form/models/yesNo';
import {t} from 'i18next';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('Help With Fees Eligibility Controller', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render help with fees eligibility page successfully', async () => {
      await request(app).get(ELIGIBILITY_HELP_WITH_FEES_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_HELP_WITH_FEES.TITLE'));
      });
    });

    it('should render help with fees eligibility with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {eligibleHelpWithFees: YesNo.YES}};
      await request(app).get(ELIGIBILITY_HELP_WITH_FEES_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_HELP_WITH_FEES.TITLE'));
      });
    });

    it('should render help with fees eligibility view when cookie for help with fees does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_HELP_WITH_FEES_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_HELP_WITH_FEES.TITLE'));
      });
    });
  });

  describe('on POST', () => {
    it('should information about help with fees page', async () => {
      await request(app).post(ELIGIBILITY_HELP_WITH_FEES_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_HELP_WITH_FEES.TITLE'));
      });
    });

    it('should redirect to eligible page if help with fees selection is no', async () => {
      await request(app).post(ELIGIBILITY_HELP_WITH_FEES_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBLE_FOR_THIS_SERVICE_URL);
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_HELP_WITH_FEES_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL);
        expect(app.request.cookies.eligibility.eligibleHelpWithFees).toBe(YesNo.YES);
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', eligibleHelpWithFees: YesNo.NO}};
      await request(app).post(ELIGIBILITY_HELP_WITH_FEES_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.eligibleHelpWithFees).toBe(YesNo.NO);
      });
    });
  });
});
