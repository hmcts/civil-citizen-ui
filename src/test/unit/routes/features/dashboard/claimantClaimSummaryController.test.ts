import request from 'supertest';
import {app} from '../../../../../main/app';
import {DASHBOARD_CLAIMANT_URL, OLD_DASHBOARD_CLAIMANT_URL} from '../../../../../main/routes/urls';

jest.mock('../../../../../main/modules/oidc');

describe('claimant Dashboard Controller', () => {
  describe('on GET', () => {
    it('should redirect old claimant dashboard URLs to the new claimant dashboard', async () => {
      await request(app).get(OLD_DASHBOARD_CLAIMANT_URL.replace(':id', '123')).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(DASHBOARD_CLAIMANT_URL.replace(':id', '123'));
      });
    });

    it('should preserve query strings when redirecting old claimant dashboard URLs', async () => {
      await request(app).get(`${OLD_DASHBOARD_CLAIMANT_URL.replace(':id', '123')}?lang=cy`).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(`${DASHBOARD_CLAIMANT_URL.replace(':id', '123')}?lang=cy`);
      });
    });
  });
});
