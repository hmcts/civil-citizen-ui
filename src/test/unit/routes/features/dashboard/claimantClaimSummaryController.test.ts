import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {DASHBOARD_CLAIMANT_URL, OLD_DASHBOARD_CLAIMANT_URL} from '../../../../../main/routes/urls';
import * as urlFormatter from '../../../../../main/common/utils/urlFormatter';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
describe('claimant Dashboard Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should redirect old claimant dashboard URL to the new claimant dashboard URL for draft id', async () => {
      await request(app)
        .get(OLD_DASHBOARD_CLAIMANT_URL.replace(':id', 'draft'))
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.headers.location).toBe('/dashboard/draft/claimantNewDesign');
        });
    });

    it('should redirect old claimant dashboard URL to the new claimant dashboard URL for case id', async () => {
      await request(app)
        .get(OLD_DASHBOARD_CLAIMANT_URL.replace(':id', '1776415088475066'))
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.headers.location).toBe('/dashboard/1776415088475066/claimantNewDesign');
        });
    });

    it('should preserve allowed language query when redirecting old claimant dashboard URLs', async () => {
      await request(app)
        .get(`${OLD_DASHBOARD_CLAIMANT_URL.replace(':id', '123')}?lang=cy`)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.headers.location).toBe(`${DASHBOARD_CLAIMANT_URL.replace(':id', '123')}?lang=cy`);
        });
    });

    it('should not preserve non-language query strings when redirecting old claimant dashboard URLs', async () => {
      await request(app)
        .get(`${OLD_DASHBOARD_CLAIMANT_URL.replace(':id', '123')}?next=https://example.com`)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.headers.location).toBe(DASHBOARD_CLAIMANT_URL.replace(':id', '123'));
        });
    });

    it('should return an error response when url construction fails', async () => {
      const constructResponseUrlWithIdParamsSpy = jest.spyOn(urlFormatter, 'constructResponseUrlWithIdParams')
        .mockImplementationOnce(() => {
          throw new Error('Mock redirect construction error');
        });

      await request(app)
        .get(OLD_DASHBOARD_CLAIMANT_URL.replace(':id', 'draft'))
        .expect(500);

      expect(constructResponseUrlWithIdParamsSpy).toHaveBeenCalledWith('draft', DASHBOARD_CLAIMANT_URL);
    });
  });
});
