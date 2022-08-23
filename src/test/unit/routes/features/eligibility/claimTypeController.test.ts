import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {NotEligibleReason} from '../../../../../main/common/form/models/eligibility/NotEligibleReason';
import {ClaimTypeOptions} from '../../../../../main/common/models/eligibility/claimTypeOptions';
import {constructUrlWithNotEligibleReson} from '../../../../../main/common/utils/urlFormatter';
import {
  ELIGIBILITY_CLAIM_TYPE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_CLAIMANT_ADDRESS_URL,
} from '../../../../../main/routes/urls';

jest.mock('../../../../../main/modules/oidc');

describe('Response Deadline Options Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should render the page claim type', async () => {
      await request(app).get(ELIGIBILITY_CLAIM_TYPE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Who are you making the claim for&#63;');
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
        expect(res.header.location).toBe(constructUrlWithNotEligibleReson(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_TYPE_MORE_THAN_ONE));
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
        expect(res.header.location).toBe(constructUrlWithNotEligibleReson(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_TYPE_A_CLIENT));
      });
    });
  });

});
