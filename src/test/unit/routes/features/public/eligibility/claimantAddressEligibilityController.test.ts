import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_TENANCY_DEPOSIT_URL,
  ELIGIBILITY_CLAIMANT_ADDRESS_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {t} from 'i18next';
import {constructUrlWithNotEligibleReason} from '../../../../../../main/common/utils/urlFormatter';
import {NotEligibleReason} from '../../../../../../main/common/form/models/eligibility/NotEligibleReason';

describe('Claimant Address Eligibility Controller', () => {

  describe('on GET', () => {
    it('should render claimant address eligibility page successfully', async () => {
      await request(app).get(ELIGIBILITY_CLAIMANT_ADDRESS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_CLAIMANT_ADDRESS.TITLE'));
      });
    });

    it('should render claimant address eligibility with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {eligibleClaimantAddress: YesNo.YES}};
      await request(app).get(ELIGIBILITY_CLAIMANT_ADDRESS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_CLAIMANT_ADDRESS.TITLE'));
      });
    });

    it('should render claimant address eligibility view when cookie for claimant eligibility does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_CLAIMANT_ADDRESS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_CLAIMANT_ADDRESS.TITLE'));
      });
    });
  });

  describe('on POST', () => {
    it('should render tenancy deposit controller page', async () => {
      await request(app).post(ELIGIBILITY_CLAIMANT_ADDRESS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_CLAIMANT_ADDRESS.TITLE'));
      });
    });

    it('should redirect to not eligible page if address question radio selection is no', async () => {
      await request(app).post(ELIGIBILITY_CLAIMANT_ADDRESS_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIMANT_ADDRESS));
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_CLAIMANT_ADDRESS_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_TENANCY_DEPOSIT_URL);
        expect(app.request.cookies.eligibility.eligibleClaimantAddress).toBe(YesNo.YES);
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', eligibleClaimantAddress: YesNo.NO}};
      await request(app).post(ELIGIBILITY_CLAIMANT_ADDRESS_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.eligibleClaimantAddress).toBe(YesNo.NO);
      });
    });
  });
});
