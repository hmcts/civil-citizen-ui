import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {constructUrlWithNotEligibleReason} from 'common/utils/urlFormatter';
import {NotEligibleReason} from 'form/models/eligibility/NotEligibleReason';

describe('Known Claim Amount Controller', () => {

  describe('on GET', () => {
    it('should render known claim amount controller page', async () => {
      await request(app).get(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you know the amount you are claiming?');
      });
    });

    it('should render known claim amount controller page with singleDefendant cookie value', async () => {
      app.request['cookies'] = {'eligibility': {knownClaimAmount: YesNo.YES}};
      await request(app).get(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you know the amount you are claiming?');
      });
    });

    it('should render known claim amount controller page with if knownClaimAmount does not exist in the cookie', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you know the amount you are claiming?');
      });
    });
  });

  describe('on POST', () => {
    it('should render known claim amount controller page', async () => {
      await request(app).post(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you know the amount you are claiming?');
      });
    });

    it('should redirect to single defendant page if single radio selection is yes', async () => {
      await request(app).post(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_SINGLE_DEFENDANT_URL);
      });
    });

    it('should redirect to not eligible page if single radio selection is no', async () => {
      await request(app).post(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_NOT_KNOWN));
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL).send({option: YesNo.YES}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_SINGLE_DEFENDANT_URL);
        expect(app.request.cookies.eligibility.knownClaimAmount).toBe(YesNo.YES);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', knownClaimAmount: YesNo.NO}};
      await request(app).post(ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL).send({option: YesNo.NO}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.knownClaimAmount).toBe(YesNo.NO);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });
  });
});
