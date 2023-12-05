import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, ELIGIBILITY_APPLY_HELP_WITH_FEES_URL, ELIGIBILITY_CLAIMANT_AGE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {constructUrlWithNotEligibleReason} from '../../../../../../main/common/utils/urlFormatter';
import {NotEligibleReason} from '../../../../../../main/common/form/models/eligibility/NotEligibleReason';
import {t} from 'i18next';

describe('Claimant Over 18 Eligibility Controller', () => {

  describe('on GET', () => {
    it('should render claimant over 18 eligibility page successfully', async () => {
      await request(app).get(ELIGIBILITY_CLAIMANT_AGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_OVER_18_CLAIMANT.TITLE'));
      });
    });

    it('should render claimant over 18 eligibility with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {eligibleDefendantAddress: YesNo.YES}};
      await request(app).get(ELIGIBILITY_CLAIMANT_AGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_OVER_18_CLAIMANT.TITLE'));
      });
    });

    it('should render claimant over 18 eligibility view when cookie for defendant eligibility does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_CLAIMANT_AGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_OVER_18_CLAIMANT.TITLE'));
      });
    });
  });

  describe('on POST', () => {
    it('should render claimant over 18 page', async () => {
      await request(app).post(ELIGIBILITY_CLAIMANT_AGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_OVER_18_CLAIMANT.TITLE'));
      });
    });

    it('should redirect to not eligible page if address question radio selection is no', async () => {
      await request(app).post(ELIGIBILITY_CLAIMANT_AGE_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.UNDER_18_CLAIMANT));
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_CLAIMANT_AGE_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_APPLY_HELP_WITH_FEES_URL);
        expect(app.request.cookies.eligibility.claimantOver18).toBe(YesNo.YES);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', claimantOver18: YesNo.NO}};
      await request(app).post(ELIGIBILITY_CLAIMANT_AGE_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.claimantOver18).toBe(YesNo.NO);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });
  });
});
