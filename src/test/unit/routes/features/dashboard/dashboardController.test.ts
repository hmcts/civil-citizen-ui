import {app} from '../../../../../main/app';
import config from 'config';
import request from 'supertest';
import nock from 'nock';
import {DASHBOARD_URL} from '../../../../../main/routes/urls';
import {CIVIL_SERVICE_CASES_URL} from '../../../../../main/app/client/civilServiceUrls';
import {
  mockCivilClaim,
  mockCivilClaimFullAdmissionPaymentOptionBySpecifiedDate,
  mockCivilClaimFullAdmissionPaymentOptionInstalments,
} from '../../../../utils/mockDraftStore';

const data = require('../../../../utils/mocks/defendantClaimsWithDifferentStatuesMock.json');

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/oidc');

describe('Dashboard page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .get(CIVIL_SERVICE_CASES_URL + 'defendant/undefined')
      .reply(200, data);
  });

  describe('on GET', () => {
    it('should return dashboard page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claims made by or against you');
    });

    it('should have proper text for NO_RESPONSE status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Response to claim.');
    });

    it('should have proper text for ELIGIBLE_FOR_CCJ_AFTER_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('County Court Judgment (CCJ) against you.');
    });

    it('should have proper text for ELIGIBLE_FOR_CCJ status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('pay the full amount immediately');
    });

    it('should have proper text for MORE_TIME_REQUESTED status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('This claim is settled.');
    });

    it('should have proper text for PAID_IN_FULL status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('This claim is settled.');
    });

    it('should have proper text for CLAIMANT_ACCEPTED_STATES_PAID status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('This claim is settled.');
    });

    it('should have proper text for PAID_IN_FULL_CCJ_CANCELLED status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('John Test confirmed');
    });

    it('should have proper text for PAID_IN_FULL_CCJ_SATISFIED status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('John Test confirmed');
    });

    it('should have proper text for TRANSFERRED status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Case sent to court.');
    });

    it('should have proper text for REDETERMINATION_BY_JUDGE status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('requested a County Court Judgment against you.');
    });

    it('should have proper text for BY status', async () => {
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionBySpecifiedDate;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('pay the full amount by');
    });

    it('should have proper text for instelments status', async () => {
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionInstalments;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('pay the full amount in instalments');
    });

    it('should have proper text for before 4pm status', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('You need to respond before 4pm on');
    });
  });
});
