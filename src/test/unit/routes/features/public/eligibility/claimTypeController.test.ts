import request from 'supertest';
import {app} from '../../../../../../main/app';
import {NotEligibleReason} from 'form/models/eligibility/NotEligibleReason';
import {ClaimTypeOptions} from 'models/eligibility/claimTypeOptions';
import {t} from 'i18next';
import {constructUrlWithNotEligibleReason} from 'common/utils/urlFormatter';
import {
  ELIGIBILITY_CLAIM_TYPE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_CLAIMANT_ADDRESS_URL,
} from 'routes/urls';

describe('Claim Type Options Controller', () => {

  describe('on GET', () => {
    it('should render the page claim type', async () => {
      await request(app).get(ELIGIBILITY_CLAIM_TYPE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Who are you making the claim for?');
      });
    });

    it('should render claimant address eligibility with set cookie value', async () => {
      app.request['cookies'] = {'eligibility': {claimType: ClaimTypeOptions.JUST_MYSELF}};
      await request(app).get(ELIGIBILITY_CLAIM_TYPE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_CLAIM_TYPE.TITLE'));
      });
    });

    it('should render claim type eligibility view when cookie for claimant eligibility does not exist', async () => {
      app.request['cookies'] = {'eligibility': {foo: 'blah'}};
      await request(app).get(ELIGIBILITY_CLAIM_TYPE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.ELIGIBILITY_CLAIM_TYPE.TITLE'));
      });
    });
  });

  describe('on POST', () => {
    it('should render error message when claim type is not selected', async () => {
      await request(app).post(ELIGIBILITY_CLAIM_TYPE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('There was a problem');
      });
    });

    it('should render not eligible page when radio more-than-one-person-or-organisation is selected', async () => {
      await request(app).post(ELIGIBILITY_CLAIM_TYPE_URL).send({ 'claimType': ClaimTypeOptions.MORE_THAN_ONE_PERSON_OR_ORGANISATION }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.MULTIPLE_CLAIMANTS));
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah'}};
      await request(app).post(ELIGIBILITY_CLAIM_TYPE_URL).send({claimType: ClaimTypeOptions.JUST_MYSELF}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_CLAIMANT_ADDRESS_URL);
        expect(app.request.cookies.eligibility.claimType).toBe(ClaimTypeOptions.JUST_MYSELF);
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', claimType: ClaimTypeOptions.A_CLIENT}};
      await request(app).post(ELIGIBILITY_CLAIM_TYPE_URL).send({claimType: ClaimTypeOptions.A_CLIENT}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.claimType).toBe(ClaimTypeOptions.A_CLIENT);
      });
    });

    it('should render not eligible page when radio just-myself is selected', async () => {
      await request(app).post(ELIGIBILITY_CLAIM_TYPE_URL).send({ 'claimType': ClaimTypeOptions.JUST_MYSELF }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_CLAIMANT_ADDRESS_URL);
      });
    });

    it('should render not eligible page when radio unknow is selected', async () => {
      await request(app).post(ELIGIBILITY_CLAIM_TYPE_URL).send({ 'claimType': ClaimTypeOptions.A_CLIENT }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_ON_BEHALF));
      });
    });
  });

});
