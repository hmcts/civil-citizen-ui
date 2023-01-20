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

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/oidc');

const mockClaimWithStatus = (stat: string) => {
  nock('http://localhost:4000')
    .get(CIVIL_SERVICE_CASES_URL + 'defendant/undefined')
    .reply(200, [
      {
        claimId: '1645882162449409',
        claimNumber: '000MC009',
        claimantName: 'John Test',
        claimAmount: '1000',
        responseDeadline: '2023-09-25T13:46:07.287',
        defendantResponseStatus: stat,
        respondent1ResponseDeadline: '2023-09-25T13:46:07.287',
      },
    ]);
};

describe('Dashboard page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return dashboard page', async () => {

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claims made by or against you');
    });

    it('should have proper text for NO_RESPONSE status', async () => {
      mockClaimWithStatus('NO_RESPONSE');
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Response to claim.');
    });

    it('should have proper text for ELIGIBLE_FOR_CCJ status', async () => {
      mockClaimWithStatus('ELIGIBLE_FOR_CCJ');
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('County Court Judgment (CCJ) against you.');
    });

    it('should have proper text for ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE and pay IMMEDIATELY status', async () => {
      mockClaimWithStatus('ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE');
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('pay the full amount immediately');
    });

    it('should have proper text for ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE and pay BY_SPECIFIED_DATE status', async () => {
      mockClaimWithStatus('ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE');
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionBySpecifiedDate;

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('pay the full amount by');
    });

    it('should have proper text for ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE and pay INSTALMENTS status', async () => {
      mockClaimWithStatus('ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE');
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionInstalments;

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('pay the full amount in instalments');
    });

    it('should have proper text for MORE_TIME_REQUESTED', async () => {
      mockClaimWithStatus('MORE_TIME_REQUESTED');
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionInstalments;

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('You need to respond before 4pm on');
    });

    it('should have proper text for PAID_IN_FULL', async () => {
      mockClaimWithStatus('PAID_IN_FULL');
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionInstalments;

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('This claim is settled.');
    });

    it('should have proper text for CLAIMANT_ACCEPTED_STATES_PAID', async () => {
      mockClaimWithStatus('CLAIMANT_ACCEPTED_STATES_PAID');
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionInstalments;

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('This claim is settled.');
    });

    it('should have proper text for PAID_IN_FULL_CCJ_CANCELLED', async () => {
      mockClaimWithStatus('PAID_IN_FULL_CCJ_CANCELLED');
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionInstalments;

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('John Test confirmed');
    });

    it('should have proper text for PAID_IN_FULL_CCJ_SATISFIED', async () => {
      mockClaimWithStatus('PAID_IN_FULL_CCJ_SATISFIED');
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionInstalments;

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('John Test confirmed');
    });

    it('should have proper text for TRANSFERRED', async () => {
      mockClaimWithStatus('TRANSFERRED');
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionInstalments;

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Case sent to court.');
    });

    it('should have proper text for REDETERMINATION_BY_JUDGE', async () => {
      mockClaimWithStatus('REDETERMINATION_BY_JUDGE');
      app.locals.draftStoreClient = mockCivilClaimFullAdmissionPaymentOptionInstalments;

      const res = await request(app).get(DASHBOARD_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('John Test requested a County Court Judgment against you.');
    });
  });
});
